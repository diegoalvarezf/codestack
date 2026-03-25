/**
 * Rate limiter with automatic fallback:
 * - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set → Upstash Redis (distributed, works across Vercel instances)
 * - Otherwise → in-memory (single instance only, fine for local dev)
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// ── In-memory fallback ─────────────────────────────────────────────────────

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Clean expired entries every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store) {
    if (win.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

function rateLimitInMemory(
  key: string,
  route: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const storeKey = `${route}:${key}`;
  const now = Date.now();

  let win = store.get(storeKey);
  if (!win || win.resetAt < now) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(storeKey, win);
  }

  win.count++;

  return {
    allowed: win.count <= limit,
    remaining: Math.max(0, limit - win.count),
    resetAt: win.resetAt,
  };
}

// ── Upstash Redis (distributed) ────────────────────────────────────────────

import type { Ratelimit as RatelimitType } from "@upstash/ratelimit";

const limiterCache = new Map<string, RatelimitType>();

async function rateLimitUpstash(
  key: string,
  route: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const cacheKey = `${route}:${limit}:${windowMs}`;
  let limiter = limiterCache.get(cacheKey);

  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: `rl:${route}`,
    });
    limiterCache.set(cacheKey, limiter);
  }

  const { success, remaining, reset } = await limiter.limit(key);

  return {
    allowed: success,
    remaining,
    resetAt: reset,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

function isUpstashConfigured(): boolean {
  return (
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * @param key      Unique identifier for the caller (e.g. IP address)
 * @param route    Route identifier (e.g. "POST /api/servers")
 * @param limit    Max requests allowed per window
 * @param windowMs Window duration in milliseconds
 */
export async function rateLimit(
  key: string,
  route: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (isUpstashConfigured()) {
    return rateLimitUpstash(key, route, limit, windowMs);
  }
  return rateLimitInMemory(key, route, limit, windowMs);
}

/**
 * Extract the caller IP from a Next.js request.
 */
export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
