CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'processing', 'complete', 'failed');--> statement-breakpoint
CREATE TABLE "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"cv_text" text NOT NULL,
	"jd_text" text,
	"target_role" varchar(200),
	"status" "analysis_status" DEFAULT 'pending' NOT NULL,
	"result" jsonb,
	"cost_usd" numeric(10, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
