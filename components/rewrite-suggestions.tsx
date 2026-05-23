import { CopyButton } from "@/components/copy-button";
import type { AnalysisResult } from "@/lib/validations";

export function RewriteSuggestions({
  rewrites,
}: {
  rewrites: AnalysisResult["rewrites"];
}) {
  if (rewrites.length === 0) {
    return (
      <div
        className="border p-3"
        style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
      >
        <p className="text-[11px] dim">
          No rewrites suggested. Bullets are tight.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {rewrites.map((r) => (
        <div
          key={r.original}
          className="border p-3"
          style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
        >
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: "var(--gm)", textDecoration: "line-through" }}
          >
            {r.original}
          </p>
          <p
            className="text-[10px] mt-1 italic"
            style={{ color: "var(--gd)" }}
          >
            → {r.reason}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {r.suggestions.map((s) => (
              <div
                key={s}
                className="flex items-start gap-2 border p-2"
                style={{
                  borderColor: "var(--gd)",
                  background: "var(--gxx)",
                }}
              >
                <p
                  className="flex-1 text-[11px] leading-relaxed"
                  style={{ color: "var(--gb)" }}
                >
                  {s}
                </p>
                <CopyButton text={s} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
