import { prisma } from '@/lib/db';
import { ConflictError, ForbiddenError, NotFoundError, buildPageResult, ok, type Result } from '@/lib/utils';

const userCard = {
  select: { id: true, profile: { select: { displayName: true, username: true, avatarUrl: true, bio: true } } },
};

export const socialService = {
  async follow(followerId: string, followingId: string): Promise<Result<{ status: string }, never>> {
    if (followerId === followingId) throw new ConflictError('You cannot follow yourself.');
    const target = await prisma.user.findFirst({
      where: { id: followingId, deletedAt: null },
      select: { profile: { select: { isPrivate: true } } },
    });
    if (!target) throw new NotFoundError('User not found.');
    if (await prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: followingId, blockedId: followerId } } })) {
      throw new ForbiddenError('You cannot follow this user.');
    }
    const status = target.profile?.isPrivate ? 'PENDING' : 'ACCEPTED';
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: { status },
      create: { followerId, followingId, status },
    });
    if (status === 'ACCEPTED') {
      await prisma.notification.create({
        data: { userId: followingId, type: 'NEW_FOLLOWER', title: 'New follower', data: { followerId } },
      });
    }
    return ok({ status });
  },

  async unfollow(followerId: string, followingId: string): Promise<Result<{ ok: true }, never>> {
    await prisma.follow.deleteMany({ where: { followerId, followingId } });
    return ok({ ok: true });
  },

  async followers(userId: string, page: number, pageSize: number) {
    const where = { followingId: userId, status: 'ACCEPTED' as const };
    const [rows, total] = await Promise.all([
      prisma.follow.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { follower: userCard },
      }),
      prisma.follow.count({ where }),
    ]);
    return buildPageResult(rows.map((r) => r.follower), total, { page, pageSize });
  },

  async following(userId: string, page: number, pageSize: number) {
    const where = { followerId: userId, status: 'ACCEPTED' as const };
    const [rows, total] = await Promise.all([
      prisma.follow.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { following: userCard },
      }),
      prisma.follow.count({ where }),
    ]);
    return buildPageResult(rows.map((r) => r.following), total, { page, pageSize });
  },

  // ── Blocks ──────────────────────────────────────────────────────────────
  async block(blockerId: string, blockedId: string): Promise<Result<{ ok: true }, never>> {
    if (blockerId === blockedId) throw new ConflictError('You cannot block yourself.');
    await prisma.$transaction([
      prisma.block.upsert({
        where: { blockerId_blockedId: { blockerId, blockedId } },
        update: {},
        create: { blockerId, blockedId },
      }),
      // Blocking severs any follow relationship in both directions.
      prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
          ],
        },
      }),
    ]);
    return ok({ ok: true });
  },

  async unblock(blockerId: string, blockedId: string): Promise<Result<{ ok: true }, never>> {
    await prisma.block.deleteMany({ where: { blockerId, blockedId } });
    return ok({ ok: true });
  },

  async blocked(blockerId: string) {
    const rows = await prisma.block.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
      include: { blocked: userCard },
    });
    return rows.map((r) => r.blocked);
  },

  // ── Saved activities ──────────────────────────────────────────────────────
  async save(userId: string, activityId: string): Promise<Result<{ ok: true }, never>> {
    const activity = await prisma.activity.findFirst({ where: { id: activityId, deletedAt: null }, select: { id: true } });
    if (!activity) throw new NotFoundError('Activity not found.');
    await prisma.savedActivity.upsert({
      where: { userId_activityId: { userId, activityId } },
      update: {},
      create: { userId, activityId },
    });
    await prisma.activityMetric.updateMany({ where: { activityId }, data: { saves: { increment: 1 } } });
    return ok({ ok: true });
  },

  async unsave(userId: string, activityId: string): Promise<Result<{ ok: true }, never>> {
    await prisma.savedActivity.deleteMany({ where: { userId, activityId } });
    return ok({ ok: true });
  },

  async listSaved(userId: string, page: number, pageSize: number) {
    const where = { userId };
    const [rows, total] = await Promise.all([
      prisma.savedActivity.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { activity: { include: { category: { select: { name: true, icon: true } } } } },
      }),
      prisma.savedActivity.count({ where }),
    ]);
    return buildPageResult(rows.map((r) => r.activity), total, { page, pageSize });
  },
};
