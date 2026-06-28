import { z } from 'zod';

/**
 * Validated server environment. Throws at startup if required vars are missing,
 * so misconfiguration fails fast and loudly rather than at request time.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_PROVIDER: z.enum(['mock', 'supabase']).default('mock'),
  AUTH_SESSION_SECRET: z.string().min(16, 'AUTH_SESSION_SECRET must be >= 16 chars'),
  MOCK_OTP_CODE: z
    .string()
    .regex(/^\d{6}$/)
    .default('000000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_PROVIDER: process.env.AUTH_PROVIDER,
  AUTH_SESSION_SECRET:
    process.env.AUTH_SESSION_SECRET ?? 'dev-only-insecure-session-secret-change-me',
  MOCK_OTP_CODE: process.env.MOCK_OTP_CODE,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!parsed.success) {
  console.error('✖ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration. See .env.example.');
}

export const env = parsed.data;
export const isMockAuth = env.AUTH_PROVIDER === 'mock';
