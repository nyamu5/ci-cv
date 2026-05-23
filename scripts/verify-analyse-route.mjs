const BASE = "http://localhost:3000";

async function post(body) {
  const r = await fetch(`${BASE}/api/analyse`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "10.42.42.42",
    },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => null);
  return { status: r.status, json };
}

async function getStatus(id) {
  const r = await fetch(`${BASE}/api/analysis/${id}`);
  return await r.json();
}

const validCv = `Jane Doe
Senior Software Engineer · 8 years experience
jane@example.com · linkedin.com/in/janedoe

EXPERIENCE
Acme Corp · Staff Engineer · 2022-present
- Led migration of 200M req/day API from REST to gRPC; cut p99 latency 40%.
- Mentored 4 engineers; 2 promoted to senior in 18 months.

Beta Inc · Senior Engineer · 2018-2022
- Designed event-sourced billing pipeline processing $50M/yr.

SKILLS
Go, Rust, Kubernetes, gRPC, PostgreSQL`.padEnd(220, " ");

console.log("=== 1. short cv → 400 ===");
const short = await post({ cv_text: "x".repeat(50) });
console.log("  status:", short.status, " error:", short.json?.error);

console.log("\n=== 2. valid cv → 200 + polling to complete ===");
const valid = await post({ cv_text: validCv });
console.log("  status:", valid.status, " id:", valid.json?.id);
const id = valid.json?.id;

if (id) {
  let last = "";
  for (let i = 0; i < 30; i++) {
    const s = await getStatus(id);
    if (s.status !== last) {
      console.log(`  t+${i * 2}s  status=${s.status}`);
      last = s.status;
    }
    if (s.status === "complete" || s.status === "failed") {
      console.log(
        "  final overall_score:",
        s.result?.overall_score ?? s.result?.error,
      );
      break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

console.log("\n=== 3. rapid POSTs from same IP → 6th should be 429 ===");
for (let i = 1; i <= 6; i++) {
  const r = await post({ cv_text: validCv });
  console.log(`  call ${i}: status=${r.status}  ${r.json?.error ?? "ok"}`);
  if (r.status === 429) break;
}
