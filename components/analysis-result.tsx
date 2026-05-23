import { JdMatchCard } from "@/components/jd-match-card";
import { RedFlagsList } from "@/components/red-flags-list";
import { RewriteSuggestions } from "@/components/rewrite-suggestions";
import { ScoreCard } from "@/components/score-card";
import { ShareButton } from "@/components/share-button";
import { asciiBar, scoreClass } from "@/lib/ascii-bar";
import type {
  AnalysisResult as Analysis,
  GatekeeperResult,
} from "@/lib/validations";

const SECTION_ORDER: Array<keyof Analysis["sections"]> = [
  "impact",
  "clarity",
  "structure",
  "relevance",
  "ats",
];

export function AnalysisResult({
  result,
  metadata,
}: {
  result: Analysis;
  metadata?: GatekeeperResult["metadata"];
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1
            className="font-mono text-xs tracking-widest"
            style={{ color: "var(--gd)" }}
          >
            &gt; analysis_result
          </h1>
          <ShareButton />
        </div>
        <div className="flex items-baseline gap-4">
          <span
            className={`font-mono text-6xl tabular-nums ${scoreClass(result.overall_score)}`}
          >
            {result.overall_score}
          </span>
          <div className="flex-1">
            <pre
              className={`font-mono text-xs ${scoreClass(result.overall_score)}`}
              style={{ letterSpacing: "-0.5px" }}
            >
              {asciiBar(result.overall_score, 30)}
            </pre>
            <p
              className="text-[10px] mt-1 tracking-widest"
              style={{ color: "var(--gd)" }}
            >
              overall_score / 100
            </p>
          </div>
        </div>
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: "var(--g)" }}
        >
          {result.summary}
        </p>
        {metadata && (metadata.primary_role || metadata.years_experience) && (
          <p
            className="text-[10px] font-mono tracking-widest"
            style={{ color: "var(--gd)" }}
          >
            analysed as: {metadata.primary_role ?? "unknown role"}
            {metadata.years_experience != null &&
              ` · ~${metadata.years_experience} years`}
          </p>
        )}
      </section>

      {result.jd_match && <JdMatchCard match={result.jd_match} />}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SECTION_ORDER.map((key) => (
          <ScoreCard key={key} name={key} section={result.sections[key]} />
        ))}
      </section>

      <section>
        <h2
          className="font-mono text-xs tracking-widest mb-3"
          style={{ color: "var(--gd)" }}
        >
          &gt; red_flags
        </h2>
        <RedFlagsList flags={result.red_flags} />
      </section>

      <section>
        <h2
          className="font-mono text-xs tracking-widest mb-3"
          style={{ color: "var(--gd)" }}
        >
          &gt; rewrites
        </h2>
        <RewriteSuggestions rewrites={result.rewrites} />
      </section>
    </div>
  );
}
