import { hmacSign, timingSafeEqual } from '@/lib/utils';
import type { SessionUser } from '@/lib/validation';
import { env } from '../env';

/**
 * Pure (Edge-safe) session token encoding/verification — no next/headers, no
 * server-only — so both the cookie helpers (Node) and middleware (Edge) can use
 * it. Token format: `base64url(payload).hmacSHA256(payload)`.
 */

export const SESSION_COOKIE = 'roame_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const ADMIN_ROLES: SessionUser['role'][] = ['ADMIN', 'SUPERADMIN'];

export function isAdminRole(role: SessionUser['role'] | undefined): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

interface SessionPayload extends SessionUser {
  iat: number;
  exp: number;
}

function encode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}
function decode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

export async function signSession(user: SessionUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { ...user, iat: now, exp: now + SESSION_TTL_SECONDS };
  const encoded = encode(JSON.stringify(payload));
  const signature = await hmacSign(env.AUTH_SESSION_SECRET, encoded);
  return `${encoded}.${signature}`;
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = await hmacSign(env.AUTH_SESSION_SECRET, encoded);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(decode(encoded)) as SessionPayload;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    const { iat: _iat, exp: _exp, ...user } = payload;
    return user;
  } catch {
    return null;
  }
}
