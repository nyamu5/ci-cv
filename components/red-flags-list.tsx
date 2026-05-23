import type { AnalysisResult } from "@/lib/validations";

type RedFlag = AnalysisResult["red_flags"][number];

const SEVERITY_ORDER: Record<RedFlag["severity"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const SEVERITY_LABEL: Record<RedFlag["severity"], string> = {
  high: "[HIGH]",
  medium: "[MED] ",
  low: "[LOW] ",
};

const SEVERITY_CLASS: Record<RedFlag["severity"], string> = {
  high: "flag-high",
  medium: "flag-medium",
  low: "flag-low",
};

export function RedFlagsList({
  flags,
}: {
  flags: AnalysisResult["red_flags"];
}) {
  if (flags.length === 0) {
    return (
      <div
        className="border p-3"
        style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
      >
        <p className="text-[11px] dim">
          No red flags detected. Solid foundation.
        </p>
      </div>
    );
  }
  const sorted = [...flags].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
  return (
    <div className="flex flex-col gap-2">
      {sorted.map((flag, i) => (
        <div
          // index-based key is acceptable here — order is stable per render
          // and these aren't reorderable in the UI
          key={`${flag.severity}-${i}-${flag.issue.slice(0, 16)}`}
          className="border p-3 flex items-start gap-3"
          style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
        >
          <span
            className={`font-mono text-[10px] ${SEVERITY_CLASS[flag.severity]}`}
          >
            {SEVERITY_LABEL[flag.severity]}
          </span>
          <div className="flex-1">
            <p className="text-[11px] bright leading-relaxed">{flag.issue}</p>
            <p className="text-[10px] dim mt-1">→ {flag.fix}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
