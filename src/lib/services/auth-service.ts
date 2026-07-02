import { prisma, type User, type Profile } from '@/lib/db';
import type {
  AdminLoginInput,
  OAuthCallbackInput,
  OtpRequestInput,
  OtpVerifyInput,
  SessionUser,
} from '@/lib/validation';
import {
  ConflictError,
  ForbiddenError,
  InMemoryRateLimiter,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
  addMinutes,
  err,
  isPast,
  ok,
  sha256,
  timingSafeEqual,
  verifyPassword,
  type Result,
} from '@/lib/utils';
import { getAuthProvider } from '../auth/providers';
import { verifyGoogleIdToken } from '../integrations/google';
import { auditService } from './audit-service';

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

// 5 OTP requests per phone per 10 minutes.
const otpRateLimiter = new InMemoryRateLimiter(5, 10 * 60 * 1000);

function toSessionUser(user: User & { profile: Profile | null }): SessionUser {
  return {
    id: user.id,
    role: user.role,
    status: user.status,
    displayName: user.profile?.displayName ?? null,
    email: user.email,
    phone: user.phone,
  };
}

export const authService = {
  /** Step 1 of phone login: issue + persist a hashed OTP. */
  async requestOtp(input: OtpRequestInput): Promise<Result<{ expiresAt: Date }, never>> {
    const limit = otpRateLimiter.check(input.phone);
    if (!limit.allowed) {
      throw new RateLimitError('Too many OTP requests. Please try again later.');
    }

    const code = await getAuthProvider().issueOtp(input.phone);
    const codeHash = await sha256(`${input.phone}:${code}`);
    const expiresAt = addMinutes(new Date(), OTP_TTL_MINUTES);

    await prisma.phoneOtp.create({
      data: { phone: input.phone, codeHash, purpose: input.purpose, expiresAt },
    });

    return ok({ expiresAt });
  },

  /** Step 2 of phone login: verify the OTP and resolve a session user. */
  async verifyOtp(input: OtpVerifyInput): Promise<Result<SessionUser, never>> {
    const otp = await prisma.phoneOtp.findFirst({
      where: { phone: input.phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new ValidationError('No active code for this number. Request a new one.');
    if (isPast(otp.expiresAt)) throw new ValidationError('This code has expired.');
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      throw new RateLimitError('Too many attempts. Request a new code.');
    }

    const candidate = await sha256(`${input.phone}:${input.code}`);
    if (!timingSafeEqual(candidate, otp.codeHash)) {
      await prisma.phoneOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new ValidationError('Incorrect code.');
    }

    // Consume the OTP and upsert the user atomically.
    const user = await prisma.$transaction(async (tx) => {
      await tx.phoneOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

      const existing = await tx.user.findUnique({
        where: { phone: input.phone },
        include: { profile: true },
      });
      if (existing) {
        return tx.user.update({
          where: { id: existing.id },
          data: { lastLoginAt: new Date(), phoneVerifiedAt: existing.phoneVerifiedAt ?? new Date() },
          include: { profile: true },
        });
      }
      return tx.user.create({
        data: {
          phone: input.phone,
          status: 'ACTIVE',
          phoneVerifiedAt: new Date(),
          lastLoginAt: new Date(),
          profile: { create: { displayName: 'New Roamer' } },
          settings: { create: {} },
          trustScore: { create: {} },
        },
        include: { profile: true },
      });
    });

    await auditService.record({ actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id });
    return ok(toSessionUser(user));
  },

  /** OAuth (Google/Apple): resolve an identity and link/create a user. */
  async oauthLogin(input: OAuthCallbackInput): Promise<Result<SessionUser, never>> {
    const identity = await getAuthProvider().verifyOAuth(input.provider, input.credential);

    const user = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: input.provider,
            providerAccountId: identity.providerAccountId,
          },
        },
        include: { user: { include: { profile: true } } },
      });
      if (account) return account.user;

      const created = await tx.user.create({
        data: {
          email: identity.email,
          status: 'ACTIVE',
          emailVerifiedAt: identity.email ? new Date() : null,
          lastLoginAt: new Date(),
          profile: { create: { displayName: identity.displayName ?? 'New Roamer' } },
          settings: { create: {} },
          trustScore: { create: {} },
          accounts: {
            create: { provider: input.provider, providerAccountId: identity.providerAccountId },
          },
        },
        include: { profile: true },
      });
      return created;
    });

    await auditService.record({ actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id });
    return ok(toSessionUser(user));
  },

  /** Real Google Sign-In: verify the id_token with Google, then link/create the user. */
  async googleLogin(idToken: string): Promise<Result<SessionUser, never>> {
    const identity = await verifyGoogleIdToken(idToken);

    const user = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: {
          provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: identity.providerAccountId },
        },
        include: { user: { include: { profile: true } } },
      });
      if (account) {
        await tx.user.update({ where: { id: account.user.id }, data: { lastLoginAt: new Date() } });
        return account.user;
      }

      return tx.user.create({
        data: {
          email: identity.email,
          status: 'ACTIVE',
          emailVerifiedAt: identity.email ? new Date() : null,
          lastLoginAt: new Date(),
          profile: {
            create: { displayName: identity.name ?? 'New Roamer', avatarUrl: identity.picture },
          },
          settings: { create: {} },
          trustScore: { create: {} },
          accounts: { create: { provider: 'GOOGLE', providerAccountId: identity.providerAccountId } },
        },
        include: { profile: true },
      });
    });

    await auditService.record({ actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id });
    return ok(toSessionUser(user));
  },

  /** Admin email/password login. Only ACTIVE admins/superadmins may sign in. */
  async adminLogin(input: AdminLoginInput): Promise<Result<SessionUser, UnauthorizedError>> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { profile: true },
    });
    // Uniform failure to avoid leaking which emails exist.
    if (!user || !user.passwordHash) return err(new UnauthorizedError('Invalid email or password.'));

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) return err(new UnauthorizedError('Invalid email or password.'));

    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new ForbiddenError('This account is not authorized for the admin dashboard.');
    }
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('This account is not active.');
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await auditService.record({ actorId: user.id, action: 'LOGIN', entityType: 'AdminUser', entityId: user.id });
    return ok(toSessionUser(user));
  },
};

// Re-exported for tests that need to clear limiter state between cases.
export { otpRateLimiter, ConflictError };
