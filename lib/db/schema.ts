import {
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const analysisStatus = pgEnum("analysis_status", [
  "pending",
  "processing",
  "complete",
  "failed",
]);

export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  cvText: text("cv_text").notNull(),
  jdText: text("jd_text"),
  targetRole: varchar("target_role", { length: 200 }),
  status: analysisStatus("status").notNull().default("pending"),
  result: jsonb("result"),
  costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
