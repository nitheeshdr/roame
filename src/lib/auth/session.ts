import 'server-only';
import { cookies } from 'next/headers';
import { UnauthorizedError } from '@/lib/utils';
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

/** Read the current session, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
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
