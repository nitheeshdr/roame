import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, isAdminRole, verifySession } from '@/lib/auth/session-token';

/**
 * Route protection for the admin area only. The public site (/) is open, and
 * API routes enforce `requireAdmin` server-side — this is the cheap first gate
 * plus redirect for /admin page navigation.
 */
const LOGIN_PATH = '/admin/login';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const isAuthed = !!session && isAdminRole(session.role) && session.status === 'ACTIVE';

  // The login page is public; bounce already-authed admins to the dashboard.
  if (pathname === LOGIN_PATH) {
    return isAuthed ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
  }

  if (!isAuthed) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run on the admin area.
  matcher: ['/admin/:path*'],
};
