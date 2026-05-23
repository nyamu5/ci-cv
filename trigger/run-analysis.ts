import { task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { analyses, db } from "@/lib/db";
import { analyseCV, gatekeeperCheck } from "@/lib/openai";
import type { AnalysisResult } from "@/lib/validations";

type FailureResult = {
  error: "gatekeeper_rejected" | "task_failed";
  reason: string;
};

/**
 * Background task that drives an analyses row from pending → complete (or failed).
 *
 * State machine (single writer — only this task transitions status after the
 * row is inserted as 'pending' by /api/analyse):
 *
 *   pending → processing → complete   (happy path)
 *                       → failed      (gatekeeper rejection or thrown error)
 *
 * Retries: 3 attempts for transient failures (network blip, OpenAI 5xx).
 * Gatekeeper rejections do NOT retry — that's a permanent decision.
 */
export const runAnalysis = task({
  id: "run-analysis",
  maxDuration: 300,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
    randomize: true,
  },
  run: async (payload: { analysisId: string }) => {
    const { analysisId } = payload;

    // Step 1 — fetch the row.
    const [row] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, analysisId));
    if (!row) {
      throw new Error(`Analysis row ${analysisId} not found`);
    }

    // Step 2 — flip to processing.
    await db
      .update(analyses)
      .set({ status: "processing" })
      .where(eq(analyses.id, analysisId));

    try {
      // Step 3 — gatekeeper (cheap; classifies + detects injection).
      const gate = await gatekeeperCheck(row.cvText);

      if (!gate.result.pass || gate.result.injection_detected) {
        const reason =
          gate.result.rejection_reason ??
          (gate.result.injection_detected
            ? "Injection attempt detected"
            : "Document was rejected");
        const failure: FailureResult = {
          error: "gatekeeper_rejected",
          reason,
        };
        await db
          .update(analyses)
          .set({
            status: "failed",
            result: failure,
            costUsd: gate.costUsd.toString(),
            completedAt: new Date(),
          })
          .where(eq(analyses.id, analysisId));
        return { status: "failed" as const, reason };
      }

      // Step 4 — full analyser pass.
      const analysis = await analyseCV({
        cvText: row.cvText,
        jdText: row.jdText,
        targetRole: row.targetRole,
        metadata: gate.result.metadata,
      });

      // Step 5 — persist completion.
      const totalCost = gate.costUsd + analysis.costUsd;
      const result: AnalysisResult = analysis.result;
      await db
        .update(analyses)
        .set({
          status: "complete",
          result,
          costUsd: totalCost.toString(),
          completedAt: new Date(),
        })
        .where(eq(analyses.id, analysisId));

      return { status: "complete" as const, costUsd: totalCost };
    } catch (err) {
      // Any thrown error (network, OpenAI 5xx, schema mismatch) marks the row
      // failed and re-throws so Trigger.dev can retry per the retry policy
      // above. After the last attempt, the row stays failed.
      const message = err instanceof Error ? err.message : String(err);
      const failure: FailureResult = {
        error: "task_failed",
        reason: message,
      };
      await db
        .update(analyses)
        .set({
          status: "failed",
          result: failure,
          completedAt: new Date(),
        })
        .where(eq(analyses.id, analysisId));
      throw err;
    }
  },
});
