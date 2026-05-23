import { z } from "zod";

export const SectionSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
  highlights: z.array(z.string()),
  improvements: z.array(z.string()),
});
export type Section = z.infer<typeof SectionSchema>;

const GatekeeperMetadataSchema = z.object({
  candidate_name: z.string().nullable(),
  primary_role: z.string().nullable(),
  years_experience: z.number().nullable(),
  top_skills: z.array(z.string()).max(5),
});

export const GatekeeperSchema = z.object({
  pass: z.boolean(),
  rejection_reason: z.string().nullable(),
  metadata: GatekeeperMetadataSchema.nullable(),
  injection_detected: z.boolean(),
});
export type GatekeeperResult = z.infer<typeof GatekeeperSchema>;

const JdMatchSchema = z.object({
  match_score: z.number().int().min(0).max(100),
  matched_keywords: z.array(z.string()),
  missing_keywords: z.array(z.string()),
  missing_skills: z.array(z.string()),
  fit_summary: z.string(),
});

export const RedFlagSeveritySchema = z.enum(["low", "medium", "high"]);
export type RedFlagSeverity = z.infer<typeof RedFlagSeveritySchema>;

const RedFlagSchema = z.object({
  issue: z.string(),
  severity: RedFlagSeveritySchema,
  fix: z.string(),
});

const RewriteSchema = z.object({
  original: z.string(),
  suggestions: z.array(z.string()).length(2),
  reason: z.string(),
});

export const AnalysisSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  summary: z.string(),
  sections: z.object({
    impact: SectionSchema,
    clarity: SectionSchema,
    structure: SectionSchema,
    relevance: SectionSchema,
    ats: SectionSchema,
  }),
  jd_match: JdMatchSchema.nullable(),
  red_flags: z.array(RedFlagSchema),
  rewrites: z.array(RewriteSchema),
});
export type AnalysisResult = z.infer<typeof AnalysisSchema>;

export const AnalyseRequestSchema = z.object({
  cv_text: z.string().min(200).max(15000),
  jd_text: z.string().max(5000).optional(),
  target_role: z.string().max(200).optional(),
});
export type AnalyseRequest = z.infer<typeof AnalyseRequestSchema>;
