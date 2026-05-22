interface PipelineLineProps {
  step: number;
  total: number;
  name: string;
  status: "waiting" | "running" | "pass" | "fail";
  elapsed?: string;
  /** 0-100, used when status is 'running' */
  progress?: number;
}

export function PipelineLine({
  step,
  total,
  name,
  status,
  elapsed,
  progress = 0,
}: PipelineLineProps) {
  const bar =
    status === "running"
      ? "█".repeat(Math.round((progress / 100) * 16)) +
        "░".repeat(16 - Math.round((progress / 100) * 16))
      : status === "pass"
        ? "████████████████"
        : status === "fail"
          ? "░░░░░░░░░░░░░░░░"
          : "░░░░░░░░░░░░░░░░";

  const statusLabel =
    status === "pass"
      ? "PASS"
      : status === "fail"
        ? "FAIL"
        : status === "running"
          ? "wait"
          : "    ";

  const barColor =
    status === "pass"
      ? "var(--g)"
      : status === "fail"
        ? "var(--rd)"
        : "var(--gd)";

  return (
    <div className="flex items-center gap-2 font-mono text-[10px] leading-7">
      <span style={{ color: "var(--gd)", width: "28px", flexShrink: 0 }}>
        [{step}/{total}]
      </span>
      <span style={{ color: "var(--gb)", width: "72px", flexShrink: 0 }}>
        {name.padEnd(10)}
      </span>
      <span style={{ color: barColor, flex: 1, letterSpacing: "-0.5px" }}>
        {bar}
      </span>
      <span style={{ color: barColor, width: "32px", flexShrink: 0 }}>
        {statusLabel}
      </span>
      {elapsed && (
        <span style={{ color: "var(--gd)", width: "36px", textAlign: "right" }}>
          {elapsed}
        </span>
      )}
    </div>
  );
}
