import { prisma } from '@/lib/db';
import type { AnalyticsEventInput } from '@/lib/validation';
import { ok, type Result } from '@/lib/utils';

export const analyticsService = {
  async track(userId: string | null, input: AnalyticsEventInput): Promise<Result<{ ok: true }, never>> {
    await prisma.analyticsEvent.create({
      data: {
        userId,
        name: input.name,
        props: input.props as object | undefined,
        sessionId: input.sessionId,
      },
    });
    return ok({ ok: true });
  },

  /** Admin dashboard summary metrics. */
  async summary() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [users, activities, bookings, events7d, topEvents] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.activity.count({ where: { deletedAt: null } }),
      prisma.booking.count({ where: { deletedAt: null } }),
      prisma.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
      prisma.analyticsEvent.groupBy({
        by: ['name'],
        where: { createdAt: { gte: since } },
        _count: { name: true },
        orderBy: { _count: { name: 'desc' } },
        take: 10,
      }),
    ]);
    return {
      totals: { users, activities, bookings },
      last7Days: { events: events7d, topEvents: topEvents.map((e) => ({ name: e.name, count: e._count.name })) },
    };
  },
};
