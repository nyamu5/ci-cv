# CV Roaster 🔥 — Master Build Plan for Claude Code

> Feed this to Claude Code one ticket at a time, in order.
> Do not start a ticket until the previous ticket's verification passes.
> Each ticket is self-contained with instructions, verification, and tests.

---

## How to Use This Document

1. Open Claude Code in your terminal or VS Code.
2. For each ticket, paste: "Execute this ticket from my build plan:" + the contents of the ticket file.
3. Run every verification step before moving on.
4. Commit after each ticket passes (the commit command is included in each file).
5. If a verification fails, fix it before continuing — do not accumulate debt.

The full text of each ticket lives in `.agents/tickets/`. This file is the index.

---

## Final Stack Reference

pnpm · Next.js 14 (App Router) · TypeScript (strict) · shadcn/ui · Tailwind ·
Biome · TanStack Form · Zod · Drizzle ORM · Supabase (Postgres + Auth) ·
OpenAI GPT-4o Mini + GPT-4o · Helicone · Trigger.dev v3 · Upstash Redis ·
pdf-parse · Railway

---

## Tickets

### Stage 0 — Repository Initialisation
- [0.1 — Initialise Git Repo & Project](tickets/0.1-init-repo.md)
- [0.2 — Environment & Folder Structure](tickets/0.2-env-and-folders.md)

### Stage 1 — Foundation (Data + Auth)
- [1.1 — Database Schema & Drizzle Setup](tickets/1.1-db-schema.md)
- [1.2 — Zod Validation Schemas + Tests](tickets/1.2-zod-validation.md)
- [1.3 — Supabase Clients & Auth Middleware](tickets/1.3-supabase-auth-middleware.md)
- [1.4 — Auth UI (Google + GitHub OAuth)](tickets/1.4-auth-ui.md)

### Stage 2 — Core Engine (PDF + Rate Limit + AI Pipeline)
- [2.1 — PDF Parsing with Garble Detection + Tests](tickets/2.1-pdf-parsing.md)
- [2.2 — Rate Limiting with Upstash Redis](tickets/2.2-rate-limiting.md)
- [2.3 — Cost Estimation Helper + Tests](tickets/2.3-cost-estimation.md)
- [2.4 — OpenAI Multi-Model Pipeline (Helicone)](tickets/2.4-openai-pipeline.md)
- [2.5 — Trigger.dev Background Job](tickets/2.5-trigger-job.md)
- [2.6 — Analyse & Polling API Routes](tickets/2.6-api-routes.md)

### Stage 3 — User Interface
- [3.1 — CV Input Form (TanStack Form)](tickets/3.1-cv-input-form.md)
- [3.2 — Results Display Components](tickets/3.2-results-components.md)
- [3.3 — Results Page with Polling](tickets/3.3-results-page-polling.md)
- [3.4 — Landing Page & Dynamic OG Images](tickets/3.4-landing-og.md)

### Stage 4 — Hardening & Deployment
- [4.1 — Error Handling & Polish Pass](tickets/4.1-error-handling.md)
- [4.2 — README & Documentation](tickets/4.2-readme.md)
- [4.3 — Deploy to Railway](tickets/4.3-deploy-railway.md)

---

# Build Summary

| Stage | Tickets | Focus                                 | Est. time |
| ----- | ------- | ------------------------------------- | --------- |
| 0     | 0.1–0.2 | Repo init, scaffold, tooling          | 1.5 hrs   |
| 1     | 1.1–1.4 | Database, validation, auth            | 3 hrs     |
| 2     | 2.1–2.6 | PDF, rate limit, AI pipeline, APIs    | 5 hrs     |
| 3     | 3.1–3.4 | Forms, results UI, landing, OG images | 4 hrs     |
| 4     | 4.1–4.3 | Hardening, docs, deploy               | 2.5 hrs   |

**Total: 15 tickets, ~16 hours across 4 days.**

## Test Coverage Summary

| Test file                 | Covers                               |
| ------------------------- | ------------------------------------ |
| tests/validations.test.ts | All Zod schemas — boundary and shape |
| tests/costs.test.ts       | AI cost estimation maths             |
| tests/pdf.test.ts         | Garble detection heuristic           |

Run all: `pnpm test`

## Daily Grouping

- **Day 1:** Stage 0 + Stage 1 (repo through auth)
- **Day 2:** Stage 2 (the full AI engine)
- **Day 3:** Stage 3 (all UI)
- **Day 4:** Stage 4 (harden, document, ship)

## Working Rhythm with Claude Code

After each ticket: run the verification block, fix anything red, then
commit with the provided message. Never start the next ticket on a
broken build — the staged structure only works if each stage is solid
before the next begins.
