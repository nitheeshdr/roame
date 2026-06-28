import { prisma } from '@/lib/db';
import { buildPageResult, ok, type Result } from '@/lib/utils';

export const notificationService = {
  async list(userId: string, page: number, pageSize: number, unreadOnly = false) {
    const where = { userId, ...(unreadOnly ? { readAt: null } : {}) };
    const [data, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { ...buildPageResult(data, total, { page, pageSize }), unread };
  },

  async markRead(userId: string, id: string): Promise<Result<{ ok: true }, never>> {
    await prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
    return ok({ ok: true });
  },

  async markAllRead(userId: string): Promise<Result<{ count: number }, never>> {
    const res = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return ok({ count: res.count });
  },

  async remove(userId: string, id: string): Promise<Result<{ ok: true }, never>> {
    await prisma.notification.deleteMany({ where: { id, userId } });
    return ok({ ok: true });
  },
};
