/**
 * Password hashing using PBKDF2 via the Web Crypto API — cross-runtime (Node 20+,
 * Edge), no native dependency. Used for admin email/password auth and seeding.
 *
 * Encoded format: `pbkdf2$<iterations>$<saltHex>$<hashHex>`
 */
import { timingSafeEqual } from './crypto';

const ITERATIONS = 120_000;
const KEY_LEN = 32; // bytes
const HASH = 'SHA-256';
const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: HASH },
    key,
    KEY_LEN * 8,
  );
  return toHex(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${hash}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = Number(parts[1]);
  const salt = fromHex(parts[2]!);
  const expected = parts[3]!;
  if (!Number.isFinite(iterations) || iterations <= 0) return false;
  const actual = await derive(password, salt, iterations);
  return timingSafeEqual(actual, expected);
}
