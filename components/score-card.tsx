import { asciiBar, scoreClass } from "@/lib/ascii-bar";
import type { Section } from "@/lib/validations";

export function ScoreCard({
  name,
  section,
}: {
  name: string;
  section: Section;
}) {
  return (
    <div
      className="border p-3 flex flex-col gap-2"
      style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: "var(--gd)" }}
        >
          {name}
        </h3>
        <span
          className={`font-mono text-2xl tabular-nums ${scoreClass(section.score)}`}
        >
          {section.score}
        </span>
      </div>
      <pre
        className={`font-mono text-[10px] ${scoreClass(section.score)}`}
        style={{ letterSpacing: "-0.5px" }}
      >
        {asciiBar(section.score, 24)}
      </pre>
      <p className="text-[11px] leading-relaxed dim">{section.feedback}</p>
      {section.highlights.length > 0 && (
        <div>
          <p
            className="text-[9px] tracking-widest"
            style={{ color: "var(--gd)" }}
          >
            + HIGHLIGHTS
          </p>
          <ul
            className="text-[10px] mt-1 space-y-0.5"
            style={{ color: "var(--g)" }}
          >
            {section.highlights.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
        </div>
      )}
      {section.improvements.length > 0 && (
        <div>
          <p
            className="text-[9px] tracking-widest"
            style={{ color: "var(--gd)" }}
          >
            - IMPROVE
          </p>
          <ul
            className="text-[10px] mt-1 space-y-0.5"
            style={{ color: "var(--am)" }}
          >
            {section.improvements.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
