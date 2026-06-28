import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../password';
import { generateOtpCode, timingSafeEqual } from '../crypto';

describe('password', () => {
  it('hashes and verifies the correct password', async () => {
    const encoded = await hashPassword('Roame@Admin123');
    expect(encoded.startsWith('pbkdf2$')).toBe(true);
    expect(await verifyPassword('Roame@Admin123', encoded)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const encoded = await hashPassword('correct horse');
    expect(await verifyPassword('battery staple', encoded)).toBe(false);
  });

  it('produces unique salts per hash', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).not.toBe(b);
  });

  it('rejects malformed encodings', async () => {
    expect(await verifyPassword('x', 'not-a-valid-hash')).toBe(false);
  });
});

describe('crypto helpers', () => {
  it('generates zero-padded OTP codes of the requested length', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(generateOtpCode(6)).toMatch(/^\d{6}$/);
    }
  });

  it('timingSafeEqual compares correctly', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'ab')).toBe(false);
  });
});
