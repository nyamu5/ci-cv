import { eq } from "drizzle-orm";
import { ImageResponse } from "next/og";
import { analyses, db } from "@/lib/db";
import type { AnalysisResult as Analysis } from "@/lib/validations";

// Important: do NOT set runtime = "edge". This deploys on Railway (Node.js).
// ImageResponse runs fine on Node and we want access to the pg pool.

export const size = { width: 1200, height: 630 };
export const alt = "ci/cv — CV analysis";
export const contentType = "image/png";

const C = {
  bg: "#060d06",
  green: "#2ECC71",
  greenBright: "#5EF09A",
  greenDim: "#1A8C4A",
  greenMuted: "rgba(46, 204, 113, 0.45)",
  amber: "#E67E22",
  red: "#E74C3C",
};

function scoreColor(score: number | null): string {
  if (score == null) return C.greenDim;
  if (score >= 75) return C.green;
  if (score >= 50) return C.amber;
  return C.red;
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db
    .select({ status: analyses.status, result: analyses.result })
    .from(analyses)
    .where(eq(analyses.id, id));

  const result =
    row?.status === "complete" ? (row.result as Analysis | null) : null;
  const score = result?.overall_score ?? null;
  const topFlags = (result?.red_flags ?? [])
    .filter((f) => f.severity === "high" || f.severity === "medium")
    .slice(0, 3);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        padding: "60px 80px",
        fontFamily: "monospace",
        color: C.green,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 28,
            color: C.greenBright,
            letterSpacing: 4,
            fontWeight: 700,
          }}
        >
          {"> CI/CV 🔥"}
        </span>
        <span style={{ fontSize: 16, color: C.greenDim, letterSpacing: 3 }}>
          job_{id.slice(0, 6)}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 36 }}>
          <span
            style={{
              fontSize: 260,
              color: scoreColor(score),
              lineHeight: 1,
              fontWeight: 700,
            }}
          >
            {score ?? "—"}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontSize: 32,
                color: C.greenDim,
                letterSpacing: 6,
                fontWeight: 700,
              }}
            >
              OVERALL_CV_SCORE
            </span>
            <span style={{ fontSize: 20, color: C.greenMuted }}>
              {score == null ? "[analysis pending]" : "/ 100"}
            </span>
          </div>
        </div>

        {topFlags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 48,
              flexWrap: "wrap",
            }}
          >
            {topFlags.map((f) => {
              const color = f.severity === "high" ? C.red : C.amber;
              return (
                <div
                  key={f.issue}
                  style={{
                    border: `1px solid ${color}`,
                    color,
                    padding: "8px 16px",
                    fontSize: 18,
                    letterSpacing: 2,
                    display: "flex",
                  }}
                >
                  [{f.severity.toUpperCase()}] {f.issue.slice(0, 38)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 16,
          color: C.greenDim,
          letterSpacing: 3,
        }}
      >
        <span>ci/cv</span>
        <span>brutally honest CV feedback</span>
      </div>
    </div>,
    size,
  );
}
