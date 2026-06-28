import { describe, expect, it } from 'vitest';
import { adminLoginSchema, otpRequestSchema, otpVerifySchema } from '../auth';

describe('auth schemas', () => {
  it('accepts a valid OTP request and defaults purpose', () => {
    const parsed = otpRequestSchema.parse({ phone: '+919000000001' });
    expect(parsed.purpose).toBe('LOGIN');
  });

  it('rejects an invalid phone number', () => {
    expect(otpRequestSchema.safeParse({ phone: 'abc' }).success).toBe(false);
  });

  it('requires a 6-digit OTP code', () => {
    expect(otpVerifySchema.safeParse({ phone: '+919000000001', code: '123456' }).success).toBe(true);
    expect(otpVerifySchema.safeParse({ phone: '+919000000001', code: '12' }).success).toBe(false);
  });

  it('normalizes admin email and enforces password length', () => {
    const parsed = adminLoginSchema.parse({ email: 'ADMIN@Roame.app', password: 'longenough' });
    expect(parsed.email).toBe('admin@roame.app');
    expect(adminLoginSchema.safeParse({ email: 'a@b.co', password: 'short' }).success).toBe(false);
  });
});
