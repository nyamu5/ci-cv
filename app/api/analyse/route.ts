import { tasks } from "@trigger.dev/sdk";
import { type NextRequest, NextResponse } from "next/server";
import { analyses, db } from "@/lib/db";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import { getSession } from "@/lib/supabase/server";
import { AnalyseRequestSchema } from "@/lib/validations";
import type { runAnalysis } from "@/trigger/run-analysis";

/**
 * Belt-and-braces sanitisation. The gatekeeper LLM call is the real defence
 * against prompt injection — this just strips a few common override phrases so
 * the cleaner CV reaches the gatekeeper. Do NOT add regex-only blocking here.
 */
function lightSanitize(text: string): string {
  return text
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, "[redacted]")
    .replace(/disregard\s+(all\s+)?prior\s+(instructions|context)/gi, "[redacted]")
    .replace(/you\s+are\s+now\s+/gi, "[redacted] ");
}

export async function POST(request: NextRequest) {
  // 1. Parse + validate.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400 },
    );
  }
  const parsed = AnalyseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.issues },
      { status: 400 },
    );
  }

  // 2. Session + rate-limit.
  const session = await getSession();
  const userId = session?.user.id ?? null;
  const identifier = getIdentifier(request, userId);
  const limit = await checkRateLimit(identifier, userId !== null);
  if (!limit.success) {
    return NextResponse.json(
      { error: "rate_limited", resetAt: limit.resetAt },
      { status: 429 },
    );
  }

  // 3. Pre-sanitise + insert pending row.
  const sanitisedCv = lightSanitize(parsed.data.cv_text);
  const [inserted] = await db
    .insert(analyses)
    .values({
      userId,
      cvText: sanitisedCv,
      jdText: parsed.data.jd_text ?? null,
      targetRole: parsed.data.target_role ?? null,
      status: "pending",
    })
    .returning({ id: analyses.id });

  if (!inserted) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  // 4. Enqueue the background analysis task.
  try {
    await tasks.trigger<typeof runAnalysis>("run-analysis", {
      analysisId: inserted.id,
    });
  } catch (err) {
    // The row is already 'pending'; we don't roll it back. The user will see
    // 'failed' if no worker picks it up, but the create itself succeeded.
    console.error("[api/analyse] trigger.dev enqueue failed:", err);
    return NextResponse.json(
      { error: "enqueue_failed", id: inserted.id },
      { status: 502 },
    );
  }

  return NextResponse.json({ id: inserted.id }, { status: 200 });
}
