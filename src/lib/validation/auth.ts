import { z } from 'zod';
import { emailSchema, otpCodeSchema, phoneSchema } from './common';

/** ── Phone OTP ──────────────────────────────────────────────────────────── */

export const otpRequestSchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(['LOGIN', 'SIGNUP', 'VERIFY_PHONE']).default('LOGIN'),
});
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

/** ── OAuth ──────────────────────────────────────────────────────────────── */

export const oauthProviderSchema = z.enum(['GOOGLE', 'APPLE']);
export type OAuthProvider = z.infer<typeof oauthProviderSchema>;

export const oauthCallbackSchema = z.object({
  provider: oauthProviderSchema,
  // The signed credential/code returned by the provider (id_token / auth code).
  credential: z.string().min(1),
});
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;

/** ── Admin email/password ───────────────────────────────────────────────── */

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/** ── Email/password signup + reset ──────────────────────────────────────── */

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().trim().min(1).max(80),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** ── Session shape carried in the auth cookie / returned to clients ─────── */

export const sessionUserSchema = z.object({
  id: z.string(),
  role: z.enum(['USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN']),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED']),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;
