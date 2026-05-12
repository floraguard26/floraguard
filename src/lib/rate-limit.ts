// Simple in-memory rate limiter for API routes.
// Replace with Redis (e.g. Upstash) in production for multi-instance deployments.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  limit: number;        // max requests
  windowMs: number;     // window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.limit - 1, resetAt };
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  store.set(key, entry);
  return { allowed: true, remaining: options.limit - entry.count, resetAt: entry.resetAt };
}

// Preconfigured limiters for specific endpoints
export const otpLimiter = (ip: string) =>
  rateLimit(`otp:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 }); // 5 per 10 min

export const detectLimiter = (userId: string) =>
  rateLimit(`detect:${userId}`, { limit: 20, windowMs: 60 * 60 * 1000 }); // 20 per hour
