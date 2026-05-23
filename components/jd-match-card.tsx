import { asciiBar, scoreClass } from "@/lib/ascii-bar";
import type { AnalysisResult } from "@/lib/validations";

type JdMatch = NonNullable<AnalysisResult["jd_match"]>;

export function JdMatchCard({ match }: { match: JdMatch }) {
  return (
    <div
      className="border p-3 flex flex-col gap-3"
      style={{ borderColor: "var(--gx)", background: "var(--bg2)" }}
    >
      <div className="flex items-baseline justify-between">
        <h3
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: "var(--gd)" }}
        >
          jd_match
        </h3>
        <span
          className={`font-mono text-3xl tabular-nums ${scoreClass(match.match_score)}`}
        >
          {match.match_score}
        </span>
      </div>
      <pre
        className={`font-mono text-[10px] ${scoreClass(match.match_score)}`}
        style={{ letterSpacing: "-0.5px" }}
      >
        {asciiBar(match.match_score, 30)}
      </pre>
      <p className="text-[11px] leading-relaxed dim">{match.fit_summary}</p>
      {match.matched_keywords.length > 0 && (
        <KeywordRow
          label="matched"
          items={match.matched_keywords}
          color="var(--g)"
        />
      )}
      {match.missing_keywords.length > 0 && (
        <KeywordRow
          label="missing kw"
          items={match.missing_keywords}
          color="var(--rd)"
        />
      )}
      {match.missing_skills.length > 0 && (
        <KeywordRow
          label="missing skills"
          items={match.missing_skills}
          color="var(--am)"
        />
      )}
    </div>
  );
}

function KeywordRow({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: string;
}) {
  return (
    <div>
      <p
        className="text-[9px] tracking-widest mb-1"
        style={{ color: "var(--gd)" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1">
        {items.map((k) => (
          <span
            key={k}
            className="text-[10px] px-1.5 py-0.5 border font-mono"
            style={{ color, borderColor: color }}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
