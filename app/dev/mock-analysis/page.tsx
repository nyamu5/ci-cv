// TEMPORARY eyeball-mock for Ticket 3.2. Remove or replace once the real
// /analysis/[id] page (Ticket 3.3) is wired up.

import { AnalysisResult } from "@/components/analysis-result";
import type {
  AnalysisResult as Analysis,
  GatekeeperResult,
} from "@/lib/validations";

const mockMetadata: GatekeeperResult["metadata"] = {
  candidate_name: "Jane Doe",
  primary_role: "Senior Software Engineer",
  years_experience: 8,
  top_skills: ["Go", "Rust", "Kubernetes", "gRPC", "PostgreSQL"],
};

const mockResult: Analysis = {
  overall_score: 74,
  summary:
    "Solid senior engineering CV. Strong impact language but spotty quantification in older roles. Skills section is a wall of nouns; trim and prioritise.",
  sections: {
    impact: {
      score: 82,
      feedback:
        "Most bullets quantify outcomes (latency cuts, $ saved). A few still tell rather than show.",
      highlights: [
        "Cut p99 latency 40% on 200M req/day API",
        "Reduced AWS bill by $1.2M/yr",
      ],
      improvements: ["Quantify the 2018-2022 billing pipeline bullets"],
    },
    clarity: {
      score: 71,
      feedback: "Generally crisp. Watch the buzzword density in the summary.",
      highlights: ["Active voice throughout"],
      improvements: ["Drop 'backend-leaning generalist' — it says nothing"],
    },
    structure: {
      score: 65,
      feedback: "One-pager is fine but section ordering could lead with impact.",
      highlights: [],
      improvements: ["Move skills above education", "Tighten education to one line"],
    },
    relevance: {
      score: 88,
      feedback: "Tight match for a Staff-track infra role.",
      highlights: ["gRPC + Kubernetes prominent", "Event-sourcing experience"],
      improvements: [],
    },
    ats: {
      score: 45,
      feedback:
        "Some headings are non-standard. Recruiters' ATS may miss your Skills section.",
      highlights: [],
      improvements: [
        "Use 'EXPERIENCE' not 'EXPERIENCE ·'",
        "Add a plain 'TECHNICAL SKILLS' section heading",
      ],
    },
  },
  jd_match: {
    match_score: 78,
    matched_keywords: ["Go", "Kubernetes", "gRPC", "PostgreSQL", "AWS"],
    missing_keywords: ["Kafka", "Snowflake"],
    missing_skills: ["streaming", "data warehousing"],
    fit_summary:
      "Strong infra fit. Gaps are in data-platform tooling, which the JD lists as nice-to-have.",
  },
  red_flags: [
    {
      issue: "No contact info on the second page",
      severity: "high",
      fix: "Add email/LinkedIn to the footer on every page.",
    },
    {
      issue: "2018-2022 role has no metrics",
      severity: "medium",
      fix: "Add one quantified bullet per year of tenure.",
    },
    {
      issue: "Education line has graduation year only",
      severity: "low",
      fix: "Optional — include institution if recognisable in target market.",
    },
  ],
  rewrites: [
    {
      original: "Drove adoption of Rust for performance-critical paths.",
      suggestions: [
        "Migrated 3 hot-path services to Rust; throughput +32%, GC pauses eliminated.",
        "Led Rust adoption (RFC + training); 4 services migrated, +30% throughput at 0 incidents.",
      ],
      reason: "Adoption verbs hide the actual change. Quantify the lift.",
    },
    {
      original: "First backend hire; built core API in Go from scratch.",
      suggestions: [
        "Built and shipped the v1 backend (Go) as first engineer; supported launch to 10k MAU in 6 months.",
        "As first backend hire, designed v1 API in Go; scaled to 10k MAU and handed off to a 4-person team.",
      ],
      reason: "'From scratch' is implied by 'first backend hire'. Show outcome.",
    },
  ],
};

export default function MockAnalysisPage() {
  return (
    <main className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full">
      <AnalysisResult result={mockResult} metadata={mockMetadata} />
    </main>
  );
}
