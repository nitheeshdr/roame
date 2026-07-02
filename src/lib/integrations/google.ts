import { NotImplementedError, UnauthorizedError } from '@/lib/utils';

/**
 * Real Google Sign-In verification. The client obtains an `id_token` from Google
 * Identity Services; we verify it against Google's tokeninfo endpoint (which
 * checks the signature + expiry) and confirm the audience matches our client id.
 * No mock — requires a configured Google OAuth client id.
 */
export interface GoogleIdentity {
  providerAccountId: string; // Google `sub`
  email: string | null;
  name: string | null;
  picture: string | null;
}

function clientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!id) {
    throw new NotImplementedError(
      'Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID (and GOOGLE_CLIENT_ID).',
    );
  }
  return id;
}

export const isGoogleConfigured =
  !!process.env.GOOGLE_CLIENT_ID || !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  const aud = clientId();
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!res.ok) throw new UnauthorizedError('Invalid Google credential.');

  const p = (await res.json()) as {
    aud?: string;
    sub?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    exp?: string;
  };

  if (!p.sub) throw new UnauthorizedError('Invalid Google credential.');
  if (p.aud !== aud) throw new UnauthorizedError('Google credential was issued for a different app.');
  if (p.exp && Number(p.exp) * 1000 < Date.now()) throw new UnauthorizedError('Google credential expired.');

  return {
    providerAccountId: p.sub,
    email: p.email ?? null,
    name: p.name ?? null,
    picture: p.picture ?? null,
  };
}
