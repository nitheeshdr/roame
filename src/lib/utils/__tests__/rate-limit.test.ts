import { describe, expect, it } from 'vitest';
import { InMemoryRateLimiter } from '../rate-limit';

describe('InMemoryRateLimiter', () => {
  it('allows up to the limit then blocks within the window', () => {
    const limiter = new InMemoryRateLimiter(3, 60_000);
    expect(limiter.check('+15550001111').allowed).toBe(true);
    expect(limiter.check('+15550001111').allowed).toBe(true);
    expect(limiter.check('+15550001111').allowed).toBe(true);
    const blocked = limiter.check('+15550001111');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('tracks keys independently', () => {
    const limiter = new InMemoryRateLimiter(1, 60_000);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
    expect(limiter.check('b').allowed).toBe(true);
  });
});
