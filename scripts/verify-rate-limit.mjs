import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
console.log(
  "env: URL",
  url ? "set" : "missing",
  "TOKEN",
  token ? "set" : "missing",
);

const redis = new Redis({ url, token });
const anon = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "24 h"),
  prefix: "rl:anon",
  analytics: false,
});

const id = `verify-${Date.now()}`;
console.log("--- 6 anon calls with id", id, "---");
for (let i = 1; i <= 6; i++) {
  const r = await anon.limit(id);
  console.log("  call", i, "-> success:", r.success, "remaining:", r.remaining);
}
