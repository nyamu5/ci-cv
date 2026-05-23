import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  /** Unix epoch milliseconds. 0 when the limiter is fail-open. */
  resetAt: number;
};

/**
 * Build the limiters lazily so we only construct a Redis client when both env
 * vars are present. Missing vars → no client → every call fails open.
 */
function buildLimiters(): {
  anon: Ratelimit;
  authed: Ratelimit;
} | null {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return {
    anon: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "24 h"),
      prefix: "rl:anon",
      analytics: false,
    }),
    authed: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "24 h"),
      prefix: "rl:user",
      analytics: false,
    }),
  };
}

const limiters = buildLimiters();

/**
 * Sliding-window rate limit.
 *
 * Anonymous (`anon:<ip>`): 5 requests per 24h.
 * Authenticated (`user:<uuid>`): 20 requests per 24h.
 *
 * Fails OPEN on Redis errors or missing config — we never block a user
 * because the rate limiter is unreachable.
 */
export async function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean,
): Promise<RateLimitResult> {
  if (!limiters) {
    return {
      success: true,
      remaining: Number.POSITIVE_INFINITY,
      resetAt: 0,
    };
  }

  const limiter = isAuthenticated ? limiters.authed : limiters.anon;
  try {
    const r = await limiter.limit(identifier);
    return { success: r.success, remaining: r.remaining, resetAt: r.reset };
  } catch (err) {
    console.warn(
      "[rate-limit] Upstash unreachable, failing open:",
      err instanceof Error ? err.message : err,
    );
    return {
      success: true,
      remaining: Number.POSITIVE_INFINITY,
      resetAt: 0,
    };
  }
}

/**
 * Build a stable rate-limit key.
 *
 * - Authenticated: `user:<userId>` (stable across IP changes).
 * - Anonymous: `anon:<ip>` extracted from x-forwarded-for (first hop) or
 *   x-real-ip. Falls back to `anon:unknown` if neither header is present.
 */
export function getIdentifier(
  request: Request,
  userId?: string | null,
): string {
  if (userId) return `user:${userId}`;

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  return `anon:${ip}`;
}
