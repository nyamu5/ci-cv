import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { asciiBar, formatJobId, scoreClass } from "@/lib/ascii-bar";
import { analyses, db } from "@/lib/db";
import { getSession } from "@/lib/supabase/server";
import type { AnalysisResult as Analysis } from "@/lib/validations";

const STATUS_LABEL: Record<string, string> = {
  pending: "[wait]",
  processing: "[run] ",
  complete: "[done]",
  failed: "[fail]",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--gd)",
  processing: "var(--gb)",
  complete: "var(--g)",
  failed: "var(--rd)",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rows = await db
    .select({
      id: analyses.id,
      status: analyses.status,
      targetRole: analyses.targetRole,
      result: analyses.result,
      createdAt: analyses.createdAt,
    })
    .from(analyses)
    .where(eq(analyses.userId, session.user.id))
    .orderBy(desc(analyses.createdAt))
    .limit(50);

  return (
    <main className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <h1
          className="font-mono text-xs tracking-widest"
          style={{ color: "var(--gd)" }}
        >
          &gt; dashboard / runs
        </h1>
        <Link
          href="/"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          new analysis
        </Link>
      </header>

      {rows.length === 0 ? (
        <div
          className="border p-6 text-center"
          style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
        >
          <p className="text-[12px] dim mb-3">no analyses yet.</p>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            start one
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => {
            const score =
              row.status === "complete" && row.result
                ? (row.result as Analysis).overall_score
                : null;
            return (
              <Link
                key={row.id}
                href={`/analysis/${row.id}`}
                className="border p-3 flex items-center gap-4 hover:bg-[color:var(--gxx)] transition-colors"
                style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
              >
                <span
                  className="font-mono text-[10px] tracking-widest"
                  style={{ color: "var(--gd)", width: "100px" }}
                >
                  {formatJobId(row.id)}
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: STATUS_COLOR[row.status], width: "56px" }}
                >
                  {STATUS_LABEL[row.status] ?? row.status}
                </span>
                <span
                  className="text-[11px] flex-1 truncate"
                  style={{ color: "var(--gm)" }}
                >
                  {row.targetRole ?? "—"}
                </span>
                {score !== null && (
                  <>
                    <pre
                      className={`font-mono text-[10px] hidden sm:block ${scoreClass(score)}`}
                      style={{ letterSpacing: "-0.5px" }}
                    >
                      {asciiBar(score, 16)}
                    </pre>
                    <span
                      className={`font-mono text-sm tabular-nums ${scoreClass(score)}`}
                      style={{ width: "32px", textAlign: "right" }}
                    >
                      {score}
                    </span>
                  </>
                )}
                <span
                  className="font-mono text-[9px] hidden md:block"
                  style={{ color: "var(--gd)" }}
                >
                  {row.createdAt.toISOString().slice(0, 10)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
