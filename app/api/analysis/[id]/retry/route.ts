import { tasks } from "@trigger.dev/sdk";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { analyses, db } from "@/lib/db";
import { getSession } from "@/lib/supabase/server";
import type { runAnalysis } from "@/trigger/run-analysis";

type Params = { params: Promise<{ id: string }> };

/**
 * Re-queue an analysis that previously transitioned to `failed`. Only
 * `task_failed` rows can be retried — `gatekeeper_rejected` is a permanent
 * decision about the CV itself and re-running won't change the outcome.
 */
export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: analyses.id,
      status: analyses.status,
      result: analyses.result,
      userId: analyses.userId,
    })
    .from(analyses)
    .where(eq(analyses.id, id));

  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Only the original owner (or anonymous owner) can retry. Anonymous rows
  // (userId is null) are retriable by anyone with the link.
  if (row.userId !== null) {
    const session = await getSession();
    if (session?.user.id !== row.userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  if (row.status !== "failed") {
    return NextResponse.json(
      { error: "not_retryable", status: row.status },
      { status: 409 },
    );
  }

  const failure = row.result as { error?: string } | null;
  if (failure?.error === "gatekeeper_rejected") {
    return NextResponse.json(
      { error: "rejection_is_permanent" },
      { status: 409 },
    );
  }

  await db
    .update(analyses)
    .set({ status: "pending", result: null, completedAt: null })
    .where(eq(analyses.id, id));

  try {
    await tasks.trigger<typeof runAnalysis>("run-analysis", { analysisId: id });
  } catch (err) {
    console.error("[api/analysis/[id]/retry] trigger.dev enqueue failed:", err);
    return NextResponse.json({ error: "enqueue_failed" }, { status: 502 });
  }

  return NextResponse.json({ id, status: "pending" });
}
