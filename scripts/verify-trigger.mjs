import { tasks } from "@trigger.dev/sdk";
import pg from "pg";

const { Client } = pg;

const cvText = `Jane Doe
Senior Software Engineer · 8 years experience
jane@example.com · linkedin.com/in/janedoe · San Francisco, CA

SUMMARY
Backend-leaning generalist with deep gRPC and distributed systems experience.
Comfortable owning architecture decisions and mentoring senior engineers.

EXPERIENCE

Acme Corp · Staff Engineer · 2022-present
- Led migration of 200M req/day API from REST to gRPC; cut p99 latency 40% and
  reduced AWS bill by $1.2M/yr.
- Mentored 4 engineers; 2 promoted to senior in 18 months.
- Designed event-sourced audit log handling 4B events/month at sub-100ms write.

Beta Inc · Senior Engineer · 2018-2022
- Designed and shipped event-sourced billing pipeline processing $50M/yr.
- Drove adoption of Rust for performance-critical paths; +30% throughput.
- On-call rotation lead; reduced p90 page-to-resolution from 45 to 12 minutes.

Gamma Labs · Software Engineer · 2016-2018
- First backend hire; built core API in Go from scratch.
- Set up CI/CD, observability stack (Prometheus + Grafana), and on-call.

EDUCATION
BSc Computer Science, University of Cape Town, 2016

SKILLS
Go, Rust, Kubernetes, gRPC, PostgreSQL, AWS, Terraform, Prometheus`;

const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

console.log("--- inserting pending row ---");
const ins = await c.query(
  "INSERT INTO analyses (cv_text, status) VALUES ($1, 'pending') RETURNING id",
  [cvText],
);
const analysisId = ins.rows[0].id;
console.log("  analysisId:", analysisId);

console.log("\n--- triggering run-analysis ---");
const handle = await tasks.trigger("run-analysis", { analysisId });
console.log("  runId:", handle.id);

console.log("\n--- polling row status (up to 90s) ---");
let lastStatus = "";
for (let i = 0; i < 45; i++) {
  const { rows } = await c.query(
    "SELECT status, cost_usd FROM analyses WHERE id=$1",
    [analysisId],
  );
  const row = rows[0];
  const status = row?.status ?? "missing";
  if (status !== lastStatus) {
    console.log(
      `  t+${i * 2}s  status=${status}  cost=${row?.cost_usd ?? "-"}`,
    );
    lastStatus = status;
  }
  if (status === "complete" || status === "failed") break;
  await new Promise((r) => setTimeout(r, 2000));
}

const final = await c.query(
  "SELECT status, cost_usd, result FROM analyses WHERE id=$1",
  [analysisId],
);
const f = final.rows[0];
console.log("\n--- final ---");
console.log("  status:", f.status);
console.log("  cost:", f.cost_usd);
if (f.status === "complete") {
  console.log("  overall_score:", f.result.overall_score);
  console.log("  summary:", f.result.summary);
} else {
  console.log("  result:", JSON.stringify(f.result));
}

await c.end();
