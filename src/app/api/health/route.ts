import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Health check for diagnosing deployments. Reports whether the database is
 * reachable and which critical env vars are present (never their values).
 * Visit /api/health on the deployment to see what's misconfigured.
 */
export async function GET() {
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    AUTH_SESSION_SECRET: !!process.env.AUTH_SESSION_SECRET,
    AUTH_PROVIDER: process.env.AUTH_PROVIDER ?? '(unset)',
  };

  let db: { ok: boolean; error?: string } = { ok: false };
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = { ok: true };
  } catch (err) {
    db = { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
  }

  return NextResponse.json({ ok: db.ok, db, env }, { status: db.ok ? 200 : 503 });
}
