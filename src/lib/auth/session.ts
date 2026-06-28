import 'server-only';
import { cookies } from 'next/headers';
import { ForbiddenError, UnauthorizedError } from '@/lib/utils';
import type { SessionUser } from '@/lib/validation';
import { env } from '../env';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  isAdminRole,
  signSession,
  verifySession,
} from './session-token';

/**
 * Server-side (Node) cookie helpers built on the Edge-safe token module.
 * This is the app's single source of "who is acting".
 */

export { SESSION_COOKIE, isAdminRole, signSession, verifySession };

/** Write the session cookie (httpOnly, secure in prod). */
export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSession(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Read the current session from the cookie, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * Read the session from either the cookie (web) or an `Authorization: Bearer
 * <token>` header (mobile/API clients) — both carry the same signed token.
 */
export async function getSessionFromRequest(request?: Request): Promise<SessionUser | null> {
  const fromCookie = await getSession();
  if (fromCookie) return fromCookie;
  const header = request?.headers.get('authorization');
  if (header?.toLowerCase().startsWith('bearer ')) {
    return verifySession(header.slice(7).trim());
  }
  return null;
}

/**
 * Guard for any authenticated user (web cookie or bearer token). Throws
 * UnauthorizedError (→ 401) when unauthenticated or not ACTIVE.
 */
export async function requireUser(request?: Request): Promise<SessionUser> {
  const session = await getSessionFromRequest(request);
  if (!session) throw new UnauthorizedError('Authentication required.');
  if (session.status !== 'ACTIVE') {
    throw new ForbiddenError('Your account is not active.');
  }
  return session;
}

/**
 * Guard for API routes / server components. Returns the admin session or throws
 * an UnauthorizedError (mapped to 401 by apiHandler).
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !isAdminRole(session.role) || session.status !== 'ACTIVE') {
    throw new UnauthorizedError('Admin access required.');
  }
  return session;
}

/** Moderator OR admin — for moderation endpoints. */
export async function requireModerator(request?: Request): Promise<SessionUser> {
  const session = await getSessionFromRequest(request);
  const allowed = session && ['MODERATOR', 'ADMIN', 'SUPERADMIN'].includes(session.role);
  if (!session || !allowed || session.status !== 'ACTIVE') {
    throw new ForbiddenError('Moderator access required.');
  }
  return session;
}
