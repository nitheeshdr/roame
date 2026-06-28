/**
 * Minimal in-memory fixed-window rate limiter. Suitable for dev/single-instance
 * and for unit-testing the OTP request flow. Swap for a Redis/Upstash-backed
 * limiter in production (the `RateLimiter` interface keeps callers unchanged).
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || entry.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.hits.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: this.limit - 1, resetAt: new Date(resetAt) };
    }

    if (entry.count >= this.limit) {
      return { allowed: false, remaining: 0, resetAt: new Date(entry.resetAt) };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: this.limit - entry.count,
      resetAt: new Date(entry.resetAt),
    };
  }

  /** Test helper. */
  reset(): void {
    this.hits.clear();
  }
}
