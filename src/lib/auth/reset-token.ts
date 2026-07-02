import { hmacSign, timingSafeEqual } from '@/lib/utils';
import { env } from '../env';

/**
 * Stateless password-reset token: `base64url(userId.exp).hmac`. No table needed;
 * validity is enforced by the signature + embedded expiry. Signed with a
 * domain-separated secret so it can't be swapped for a session token.
 */
const SECRET = `${env.AUTH_SESSION_SECRET}:pwreset`;
const TTL_SECONDS = 30 * 60;

export async function createResetToken(userId: string): Promise<string> {
  const payload = `${userId}.${Math.floor(Date.now() / 1000) + TTL_SECONDS}`;
  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  const sig = await hmacSign(SECRET, encoded);
  return `${encoded}.${sig}`;
}

export async function verifyResetToken(token: string): Promise<string | null> {
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expected = await hmacSign(SECRET, encoded);
  if (!timingSafeEqual(sig, expected)) return null;
  const [userId, exp] = Buffer.from(encoded, 'base64url').toString('utf8').split('.');
  if (!userId || !exp || Number(exp) * 1000 < Date.now()) return null;
  return userId;
}
