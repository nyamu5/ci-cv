import { describe, expect, it } from "vitest";
import {
  AnalyseRequestSchema,
  AnalysisSchema,
  GatekeeperSchema,
} from "@/lib/validations";

const section = {
  score: 80,
  feedback: "Solid section.",
  highlights: ["clear bullets"],
  improvements: ["quantify outcomes"],
};

const validAnalysis = {
  overall_score: 78,
  summary: "Strong CV.",
  sections: {
    impact: section,
    clarity: section,
    structure: section,
    relevance: section,
    ats: section,
  },
  jd_match: null,
  red_flags: [],
  rewrites: [
    {
      original: "Worked on stuff.",
      suggestions: ["Drove 30% revenue.", "Delivered Y in Z months."],
      reason: "Too vague.",
    },
  ],
};

describe("AnalyseRequestSchema", () => {
  it("rejects cv_text under 200 chars", () => {
    const r = AnalyseRequestSchema.safeParse({ cv_text: "x".repeat(199) });
    expect(r.success).toBe(false);
  });

  it("rejects cv_text over 15000 chars", () => {
    const r = AnalyseRequestSchema.safeParse({ cv_text: "x".repeat(15001) });
    expect(r.success).toBe(false);
  });

  it("accepts a valid request with optional fields omitted", () => {
    const r = AnalyseRequestSchema.safeParse({ cv_text: "a".repeat(500) });
    expect(r.success).toBe(true);
  });
});

describe("AnalysisSchema", () => {
  it("rejects a section score above 100", () => {
    const r = AnalysisSchema.safeParse({
      ...validAnalysis,
      sections: {
        ...validAnalysis.sections,
        impact: { ...section, score: 101 },
      },
    });
    expect(r.success).toBe(false);
  });

  it("accepts jd_match as null", () => {
    const r = AnalysisSchema.safeParse(validAnalysis);
    expect(r.success).toBe(true);
  });

  it("rejects a rewrites entry with 1 suggestion (must be 2)", () => {
    const r = AnalysisSchema.safeParse({
      ...validAnalysis,
      rewrites: [
        {
          original: "Worked on stuff.",
          suggestions: ["only one"],
          reason: "Vague.",
        },
      ],
    });
    expect(r.success).toBe(false);
  });
});

describe("GatekeeperSchema", () => {
  it("requires injection_detected to be present", () => {
    const r = GatekeeperSchema.safeParse({
      pass: true,
      rejection_reason: null,
      metadata: null,
    });
    expect(r.success).toBe(false);
  });
});
