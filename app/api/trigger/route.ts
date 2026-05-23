import { NextResponse } from "next/server";

/**
 * Trigger.dev v3 does not require an in-app webhook receiver. Tasks are
 * queued via the SDK (`runAnalysis.trigger({ analysisId })`) and executed by
 * Trigger.dev's workers (`pnpm dlx trigger.dev@latest dev` locally or via
 * `pnpm dlx trigger.dev@latest deploy` in prod). This route is kept as a
 * file-skeleton placeholder per Ticket 0.2 and returns 410 so accidental
 * hits surface immediately.
 */
export async function POST() {
  return NextResponse.json(
    { error: "not_used", note: "Trigger.dev v3 needs no webhook route." },
    { status: 410 },
  );
}
