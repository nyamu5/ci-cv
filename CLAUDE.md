# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repo is pre-implementation. The only source of truth right now is `.agents/project-spec.md` — a ticketed build plan for **CV Roaster**, a Next.js app that gives AI feedback on a pasted/uploaded CV.

Work is driven ticket-by-ticket from that spec (Stage 0 → 4, tickets 0.1 through 4.3). Each ticket has its own verification block and commit message. Do not start a ticket until the previous one's verification passes; do not bundle tickets into one commit.

When a user asks you to "do the next ticket" or similar, read `.agents/project-spec.md` and execute exactly the next unfinished ticket — including its verification and the commit message it specifies.

## Target stack

pnpm · Next.js 16 (App Router, React 19) · TypeScript strict (`noUncheckedIndexedAccess: true`) · shadcn/ui (base-nova preset, `@base-ui/react`) · Tailwind v4 · Biome · TanStack Form · Zod · Drizzle ORM · Supabase (Postgres + Auth) · OpenAI (GPT-4o-mini + GPT-4o) via Helicone proxy · Trigger.dev v3 · Upstash Redis · pdf-parse · Railway.

Note: the ticket text says "Next.js 14" but `create-next-app@latest` installs Next 16 + React 19; the architecture and patterns in the spec all still apply. Toasts use `sonner` (the shadcn replacement for the deprecated `toast` component).

## Commands (once Ticket 0.1 lands)

- `pnpm dev` — Next dev server
- `pnpm build` / `pnpm start` — prod build/serve
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm check` — Biome lint+format with `--write`
- `pnpm test` — Vitest one-shot · `pnpm test:watch` — watch mode
- Single test: `pnpm test path/to/file.test.ts` or `pnpm test -t "test name"`
- `pnpm db:generate` / `pnpm db:push` / `pnpm db:studio` — Drizzle migrations & studio
- `pnpm dlx trigger.dev@latest dev` — local Trigger.dev worker (required for the analysis pipeline to run end-to-end locally)
- `pnpm dlx trigger.dev@latest deploy` — deploy background tasks to prod

## Architecture (target — being built ticket by ticket)

**Request flow.** Frontend (`components/cv-input-form.tsx`) → `POST /api/analyse` validates with `AnalyseRequestSchema`, rate-limits via Upstash, inserts a `pending` row in `analyses`, and enqueues a Trigger.dev task. The page navigates to `/analysis/[id]`, which polls `GET /api/analysis/[id]` every 2s until status flips to `complete` or `failed`.

**Two-stage AI pipeline** (`lib/openai.ts`, called from `trigger/run-analysis.ts`):
1. **Gatekeeper** — `gpt-4o-mini`, temp 0, JSON mode. Classifies the document, detects prompt-injection, extracts metadata (name, role, years, top skills). Validated by `GatekeeperSchema`. Cheap fail-fast layer.
2. **Analyser** — `gpt-4o`, temp 0.3, JSON mode. Receives the gatekeeper's metadata in its system prompt and produces the full scored analysis. Validated by `AnalysisSchema`.

Both calls go through the Helicone proxy (`baseURL: https://oai.helicone.ai/v1`) with `Helicone-Property-Stage` headers so each stage is observable separately. On Zod validation failure throw a typed `AIValidationError` carrying the raw response — never leak it to the user.

**Persistence.** Single `analyses` table (Drizzle, `lib/db/schema.ts`) with a `pgEnum` status (`pending` | `processing` | `complete` | `failed`), nullable `user_id` (anonymous analyses allowed), `cv_text`, `jd_text`, `target_role`, `result jsonb`, `cost_usd numeric(10,6)`, timestamps. The Trigger task is the only writer for status transitions after insert.

**Auth.** Supabase SSR (`@supabase/ssr`) with browser/server client split (`lib/supabase/{client,server}.ts`). `middleware.ts` refreshes the session on every request and gates `/dashboard`. OAuth providers (Google + GitHub) are configured in the Supabase dashboard, not in code.

**Rate limiting** (`lib/rate-limit.ts`). Upstash sliding window: anonymous 5/24h keyed by IP (`anon:{ip}`), authenticated 20/24h keyed by user id (`user:{id}`). **Fail open** if Redis is unreachable — log a warning, never block a user because the limiter is down.

**PDF parsing** (`lib/pdf.ts`). `pdf-parse` only — no vision parsing (cost). Garble heuristic: alphanumeric ratio < 0.6 OR avg word length > 15 → `qualityWarning: true`, surfaced in the upload UI advising the user to paste instead. Extract `isLikelyGarbled` as a pure function so it's unit-testable.

**Cost tracking** (`lib/costs.ts`). Per-1M-token pricing table: `gpt-4o-mini` $0.15/$0.60, `gpt-4o` $2.50/$10.00. Sum gatekeeper + analyser costs, store on the row. Throw on unknown model.

**OG images.** `app/analysis/[id]/opengraph-image.tsx` via `next/og` `ImageResponse`. **Do not** set `runtime = 'edge'` — deploy target is Railway (Node.js). Inline styles only (no Tailwind).

## Workflow conventions from the spec

- TypeScript strict + `noUncheckedIndexedAccess` are non-negotiable. Don't relax tsconfig to make errors go away.
- Biome is the only linter/formatter — no ESLint, no Prettier.
- Validation tests live in `tests/` (Vitest). Boundary cases (length limits, enum bounds, required-field shape) are the priority — see ticket 1.2 for the canonical seven cases.
- Every ticket ends with its own `git commit -m "..."` in the spec — use that exact message.
- The injection-defence story is layered: light pre-sanitisation in `/api/analyse` is belt-and-braces; the gatekeeper LLM call is the real defence. Don't try to do regex-only injection blocking.
- Deployment target is Railway (nixpacks auto-detect, no Dockerfile). Keep that in mind for any runtime/edge choices.
