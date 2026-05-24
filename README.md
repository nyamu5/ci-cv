# ci/cv 🔥

Brutally honest, scored AI feedback on your CV — paste it, upload a PDF, or pair it with a job description for keyword-match scoring. Built as a CI/CD-pipeline metaphor: cheap gatekeeper pass, then full analyser pass, all observable in LangSmith.

> **Live demo:** https://ci-cv-production.up.railway.app · **Screenshot:** _coming soon_

---

## Features

- **Section scoring** — impact · clarity · structure · relevance · ATS, each scored 0–100 with concrete highlights and improvements.
- **JD match** — paste a job description, get matched keywords, missing keywords, missing skills, and a fit score.
- **Red flags** — sorted high → medium → low. Each flag comes with a specific fix, not vague advice.
- **AI rewrites** — the weakest bullets get two concrete alternatives each, copy-paste ready.
- **Sharable URLs** — every analysis has a permalink with a dynamic OG image (score + top red flags). Send to a mentor for a second opinion.
- **Anonymous-first** — no account needed to run an analysis. Sign in with Google or GitHub if you want history.
- **Prompt-injection hardened** — a cheap gatekeeper pass classifies the document and rejects override attempts before any expensive call.

---

## Tech stack

| Layer            | Choice                                          |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 16 (App Router, React 19)               |
| Language         | TypeScript (`strict`, `noUncheckedIndexedAccess`) |
| Styling          | Tailwind v4 + shadcn/ui (base-nova preset)      |
| Forms            | TanStack Form + Zod                             |
| Database         | Supabase Postgres + Drizzle ORM                 |
| Auth             | Supabase Auth (Google + GitHub OAuth)           |
| AI               | OpenAI GPT-4o-mini + GPT-4o                     |
| Tracing          | LangSmith (`wrapOpenAI` + stage metadata)       |
| Background jobs  | Trigger.dev v3                                  |
| Rate limiting    | Upstash Redis (sliding window)                  |
| PDF parsing      | pdf-parse v2 + garble heuristic                 |
| Linter/formatter | Biome                                           |
| Tests            | Vitest                                          |
| Hosting          | Railway (nixpacks, no Dockerfile)               |

---

## Engineering decisions

### Two-stage AI pipeline (and what it costs)

Every analysis runs two model calls: a cheap **gatekeeper** (`gpt-4o-mini`, temp 0, 300 tokens) that classifies the document, detects prompt-injection, and extracts metadata; then the full **analyser** (`gpt-4o`, temp 0.3, 2500 tokens) that produces the scored output. Rejected docs short-circuit before the expensive call — typical legit-CV cost lands around **$0.005–$0.01**; an injection attempt costs ~$0.0001 and never reaches the analyser. Both calls go through `wrapOpenAI` from the LangSmith SDK with a `stage` metadata tag so each pass is independently observable.

### Trigger.dev v3 over Inngest

Trigger.dev's v3 task model is straightforward — `task({ id, run })` and `tasks.trigger(id, payload)` — with a generous free tier, durable runs, retries baked in, and a clear local-dev story (`trigger.dev dev`). Inngest's primitives (`step.run`, `step.sleep`) are powerful but the migration cost from a simple "queue this, poll the row" model isn't worth it for a single-task service. Trigger.dev's dashboard also gives the same per-run observability for free, which means I didn't need to build a runs explorer myself.

### Railway over Vercel

Railway runs the same nixpacks build pipeline as Vercel without the function-execution constraints — long-running OpenAI calls, no 60-second cap, and the Postgres pool from the app stays warm. Vercel's strength is edge-rendering and image optimisation, neither of which this app needs (we deliberately set `runtime` to Node in `opengraph-image.tsx`). Railway also bills predictably on container minutes rather than per-invocation, which suits the bursty "submit → wait → render" pattern.

### Drizzle over Prisma

Drizzle's typed query builder feels like writing SQL with a TypeScript checker watching — no migration of mental model from "real SQL" to "Prisma's interpretation of relations." Generated migrations are plain SQL you can read and edit, and the runtime is small enough that cold start on a serverless platform isn't a concern. Prisma's strength is its broader Studio / Accelerate / Optimize ecosystem; for a one-table app, Drizzle's lower ceremony wins.

### Biome over Prettier + ESLint

One binary, one config (`biome.json`), one pass. Biome's lint+format runs in well under a second on this repo where ESLint + Prettier together took noticeably longer, and the Rust-based engine means the same speed scales to a much larger codebase. It also caught a real issue during this build (`useSemanticElements` on a div-as-button) that I'd otherwise have shipped. Trade-off: smaller plugin ecosystem than ESLint, but the recommended rule set covers nearly everything I'd care about.

### pdf-parse over vision-based parsing

A vision-based pipeline (render PDF page → call `gpt-4o` on the image) would give cleaner text on multi-column or designer CVs, but at roughly **100× the cost per analysis**. Instead pdf-parse extracts text cheaply, a small heuristic (`isLikelyGarbled`: alphanumeric ratio < 0.6 or avg word length > 15) detects when extraction quality is poor, and the UI nudges the user to paste their CV directly. That keeps gatekeeper costs at fractions of a cent and pushes the rare edge case to a human-driven fallback.

---

## Running locally

```bash
# 1. clone + install
git clone https://github.com/nyamu5/ci-cv.git
cd ci-cv
pnpm install

# 2. env
cp .env.example .env.local
# then fill in real values — see the table below

# 3. push schema to Supabase (once)
pnpm db:push

# 4. start Next.js
pnpm dev

# 5. in a second terminal — start the Trigger.dev dev worker
pnpm dlx trigger.dev@latest dev
```

Visit http://localhost:3000 and submit a CV. The pending page polls `/api/analysis/[id]` every 2s; results show up in ~10 seconds.

### Common pnpm scripts

```
pnpm dev          # next dev
pnpm build        # next build (also runs tsc --noEmit)
pnpm typecheck    # tsc --noEmit only
pnpm check        # biome check --write .
pnpm test         # vitest run
pnpm db:generate  # drizzle-kit generate
pnpm db:push      # drizzle-kit push
pnpm db:studio    # drizzle-kit studio
```

---

## Environment variables

| Variable                          | Description                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project URL (e.g. `https://xxx.supabase.co`).                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase anonymous publishable key. Safe to expose to the browser.                     |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase service-role key. **Never** ship to the client.                               |
| `OPENAI_API_KEY`                  | OpenAI API key with access to `gpt-4o-mini` and `gpt-4o`.                              |
| `LANGSMITH_API_KEY`               | LangSmith API key for tracing AI calls.                                                |
| `LANGSMITH_PROJECT`               | LangSmith project name (e.g. `cv-roaster`). Traces are grouped here.                   |
| `LANGSMITH_TRACING`               | Set to `true` to actually ship traces. The wrapper is a no-op otherwise.               |
| `UPSTASH_REDIS_REST_URL`          | Upstash Redis REST URL for rate-limit storage. Optional — rate-limit fails open if absent. |
| `UPSTASH_REDIS_REST_TOKEN`        | Upstash Redis REST token. Optional, paired with the URL above.                         |
| `TRIGGER_SECRET_KEY`              | Trigger.dev dev/prod secret key (`tr_dev_…` or `tr_prod_…`).                           |
| `DATABASE_URL`                    | Postgres connection URL. **Use the Supabase Session Pooler** (`postgres.{ref}@aws-…pooler.supabase.com:5432/postgres`) — the direct connection is IPv6-only on free-tier projects. URL-encode `@` in passwords as `%40`. |

---

## Supabase setup

In your Supabase project dashboard:

1. **Authentication → Providers** — enable Google and GitHub. Each provider needs its own OAuth app (Google Cloud Console / GitHub OAuth apps page); paste your Supabase callback URL into both:
   ```
   https://{your-project-ref}.supabase.co/auth/v1/callback
   ```
2. **Authentication → URL Configuration** — add your deployment URL(s) to the allow-list (e.g. `http://localhost:3000`, `https://your-app.up.railway.app`).
3. **Project Settings → Database → Connection string** — copy the **Session pooler** URL (port 5432) for `DATABASE_URL`. Don't use the Direct connection unless you have the IPv4 add-on enabled.

The first `pnpm db:push` after these steps will create the `analyses` table and `analysis_status` enum.

---

## Built by

[Nyamu Wanyoike](https://github.com/nyamu5) · [github.com/nyamu5](https://github.com/nyamu5) · [linkedin.com/in/nyamu5](https://linkedin.com/in/nyamu5)
