import { prisma, type Prisma } from '@/lib/db';
import type {
  UpdateInterestsInput,
  UpdateLocationInput,
  UpdateProfileInput,
  UpdateSettingsInput,
} from '@/lib/validation';
import { NotFoundError, buildPageResult, ok, type Result } from '@/lib/utils';
import { setGeographyPoint } from '@/lib/db-geo';

const meSelect = {
  id: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  profile: true,
  settings: true,
  trustScore: true,
  interests: { include: { interest: true } },
} satisfies Prisma.UserSelect;

const publicSelect = {
  id: true,
  createdAt: true,
  profile: {
    select: { displayName: true, username: true, bio: true, avatarUrl: true, city: true, isPrivate: true },
  },
  trustScore: { select: { score: true, level: true } },
  interests: { include: { interest: { select: { slug: true, name: true, icon: true } } } },
} satisfies Prisma.UserSelect;

export const profileService = {
  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: meSelect });
    if (!user) throw new NotFoundError('User not found.');
    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const { isPrivate, ...rest } = input;
    const profile = await prisma.profile.update({
      where: { userId },
      data: { ...rest, ...(isPrivate === undefined ? {} : { isPrivate }) },
    });
    return ok(profile);
  },

  async updateInterests(userId: string, input: UpdateInterestsInput): Promise<Result<{ count: number }, never>> {
    const interests = await prisma.interest.findMany({
      where: { slug: { in: input.interests }, isActive: true },
      select: { id: true },
    });
    await prisma.$transaction([
      prisma.userInterest.deleteMany({ where: { userId } }),
      prisma.userInterest.createMany({
        data: interests.map((i) => ({ userId, interestId: i.id })),
        skipDuplicates: true,
      }),
    ]);
    return ok({ count: interests.length });
  },

  async updateSettings(userId: string, input: UpdateSettingsInput) {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: input,
      create: { userId, ...input },
    });
    return ok(settings);
  },

  async updateLocation(userId: string, input: UpdateLocationInput): Promise<Result<{ ok: true }, never>> {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new NotFoundError('Profile not found.');
    if (input.city) {
      await prisma.profile.update({ where: { userId }, data: { city: input.city } });
    }
    await setGeographyPoint('profiles', 'homeLocation', profile.id, input);
    return ok({ ok: true });
  },

  async publicProfile(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: publicSelect,
    });
    if (!user) throw new NotFoundError('User not found.');
    const [followers, following] = await Promise.all([
      prisma.follow.count({ where: { followingId: id } }),
      prisma.follow.count({ where: { followerId: id } }),
    ]);
    return { ...user, followers, following };
  },

  async userActivities(id: string, page: number, pageSize: number) {
    const where: Prisma.ActivityWhereInput = {
      hostId: id,
      deletedAt: null,
      visibility: 'PUBLIC',
    };
    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { startsAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activity.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  },

  async userReviews(id: string, page: number, pageSize: number) {
    const where: Prisma.ReviewWhereInput = { subjectId: id, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: { select: { profile: { select: { displayName: true, avatarUrl: true } } } } },
      }),
      prisma.review.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  },
};
