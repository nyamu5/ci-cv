import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisPending } from "@/components/analysis-pending";
import { AnalysisResult } from "@/components/analysis-result";
import { RetryButton } from "@/components/retry-button";
import { buttonVariants } from "@/components/ui/button";
import { analyses, db } from "@/lib/db";
import type { AnalysisResult as Analysis } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

type FailureResult = {
  error: "gatekeeper_rejected" | "task_failed";
  reason: string;
};

async function fetchRow(id: string) {
  const [row] = await db
    .select({
      id: analyses.id,
      status: analyses.status,
      result: analyses.result,
    })
    .from(analyses)
    .where(eq(analyses.id, id));
  return row;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const row = await fetchRow(id);
  if (!row) return { title: "Not found · Resume Roast" };

  let title = "CV Analysis · Resume Roast";
  let description = "Brutally honest AI feedback on your CV.";
  if (row.status === "complete" && row.result) {
    const r = row.result as Analysis;
    title = `CV Analysis — Score: ${r.overall_score}/100`;
    description = r.summary;
  }
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AnalysisPage({ params }: Params) {
  const { id } = await params;
  const row = await fetchRow(id);
  if (!row) notFound();

  if (row.status === "complete" && row.result) {
    return (
      <main className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full">
        <AnalysisResult result={row.result as Analysis} />
      </main>
    );
  }

  if (row.status === "failed") {
    const failure = (row.result ?? {
      error: "task_failed",
      reason: "Unknown failure",
    }) as FailureResult;
    const isInjection = failure.error === "gatekeeper_rejected";
    // Surface the rejection reason verbatim for gatekeeper outcomes (they're
    // already short and user-friendly: "not a CV", "injection attempt
    // detected"). For task_failed we replace technical errors with a generic
    // message — the real reason is still in the DB for log inspection.
    const displayReason = isInjection
      ? failure.reason
      : "Something went wrong while running the analysis. The error has been logged. Retrying usually fixes transient issues like network blips.";
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="border p-6 max-w-md w-full flex flex-col gap-4"
          style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
        >
          <h1
            className="font-mono text-xs tracking-widest"
            style={{ color: "var(--rd)" }}
          >
            &gt; [{isInjection ? "rejected" : "failed"}]
          </h1>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: "var(--g)" }}
          >
            {displayReason}
          </p>
          <div className="flex gap-2">
            {!isInjection && <RetryButton analysisId={id} />}
            <Link
              href="/"
              className={buttonVariants({
                variant: isInjection ? "outline" : "ghost",
              })}
            >
              {isInjection ? "edit and try again" : "home"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AnalysisPending
      id={id}
      initialStatus={row.status as "pending" | "processing"}
    />
  );
}
