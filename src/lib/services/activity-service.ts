import { prisma, type Prisma } from '@/lib/db';
import type {
  CreateActivityInput,
  ListActivitiesQuery,
  NearbyActivitiesQuery,
  SearchActivitiesQuery,
  UpdateActivityInput,
} from '@/lib/validation';
import { ForbiddenError, NotFoundError, buildPageResult, ok, type Result } from '@/lib/utils';
import { nearbyIds, setGeographyPoint } from '@/lib/db-geo';

const cardInclude = {
  host: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } } },
  category: { select: { slug: true, name: true, icon: true, color: true } },
  _count: { select: { participants: true, savedBy: true } },
} satisfies Prisma.ActivityInclude;

async function hydrate(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await prisma.activity.findMany({
    where: { id: { in: ids } },
    include: cardInclude,
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

export const activityService = {
  async create(hostId: string, input: CreateActivityInput) {
    const { location, tags, ...data } = input;
    const activity = await prisma.$transaction(async (tx) => {
      const created = await tx.activity.create({
        data: {
          ...data,
          hostId,
          status: 'PUBLISHED',
          participants: { create: { userId: hostId, role: 'HOST', status: 'JOINED' } },
          conversation: { create: { type: 'ACTIVITY', creatorId: hostId } },
          metrics: { create: {} },
        },
      });
      if (tags?.length) {
        for (const name of tags) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const tag = await tx.tag.upsert({ where: { slug }, update: {}, create: { slug, name } });
          await tx.activityTag.create({ data: { activityId: created.id, tagId: tag.id } });
        }
      }
      return created;
    });
    if (location) await setGeographyPoint('activities', 'location', activity.id, location);
    return ok(activity);
  },

  async getById(id: string, viewerId?: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...cardInclude,
        tags: { include: { tag: true } },
        media: true,
        venue: { select: { id: true, name: true, city: true } },
      },
    });
    if (!activity) throw new NotFoundError('Activity not found.');
    // Best-effort view metric.
    await prisma.activityMetric.updateMany({
      where: { activityId: id },
      data: { views: { increment: 1 } },
    });
    const joined = viewerId
      ? !!(await prisma.activityParticipant.findUnique({
          where: { activityId_userId: { activityId: id, userId: viewerId } },
        }))
      : false;
    return { ...activity, viewerJoined: joined };
  },

  async update(actorId: string, id: string, input: UpdateActivityInput): Promise<Result<unknown, never>> {
    const activity = await prisma.activity.findFirst({ where: { id, deletedAt: null } });
    if (!activity) throw new NotFoundError('Activity not found.');
    if (activity.hostId !== actorId) throw new ForbiddenError('Only the host can edit this activity.');

    const { location, ...data } = input;
    const updated = await prisma.activity.update({ where: { id }, data });
    if (location) await setGeographyPoint('activities', 'location', id, location);
    return ok(updated);
  },

  async remove(actorId: string, id: string, isAdmin = false): Promise<Result<{ id: string }, never>> {
    const activity = await prisma.activity.findFirst({ where: { id, deletedAt: null } });
    if (!activity) throw new NotFoundError('Activity not found.');
    if (activity.hostId !== actorId && !isAdmin) {
      throw new ForbiddenError('Only the host can delete this activity.');
    }
    await prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });
    return ok({ id });
  },

  async list(query: ListActivitiesQuery) {
    const where: Prisma.ActivityWhereInput = {
      deletedAt: null,
      status: query.status ?? 'PUBLISHED',
      visibility: 'PUBLIC',
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: cardInclude,
        orderBy: { startsAt: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.activity.count({ where }),
    ]);
    return buildPageResult(data, total, query);
  },

  async mine(userId: string, kind: 'all' | 'hosted' | 'joined', page: number, pageSize: number) {
    let where: Prisma.ActivityWhereInput;
    if (kind === 'hosted') {
      where = { hostId: userId, deletedAt: null };
    } else if (kind === 'joined') {
      where = { deletedAt: null, participants: { some: { userId, status: { in: ['JOINED', 'ATTENDED'] } } } };
    } else {
      where = {
        deletedAt: null,
        OR: [{ hostId: userId }, { participants: { some: { userId } } }],
      };
    }
    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: cardInclude,
        orderBy: { startsAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activity.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  },

  async nearby(query: NearbyActivitiesQuery) {
    const rows = await nearbyIds({
      table: 'activities',
      column: 'location',
      center: { lat: query.lat, lng: query.lng },
      radiusMeters: query.radiusKm * 1000,
      take: query.pageSize,
      skip: (query.page - 1) * query.pageSize,
      extraWhere: `"deletedAt" IS NULL AND status = 'PUBLISHED' AND visibility = 'PUBLIC'`,
    });
    const data = await hydrate(rows.map((r) => r.id));
    const distances = new Map(rows.map((r) => [r.id, Math.round(r.distance_m)]));
    return {
      data: data.map((a) => ({ ...a!, distanceM: distances.get(a!.id) ?? null })),
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async search(query: SearchActivitiesQuery) {
    return this.list({ ...query, q: query.q, status: 'PUBLISHED' } as ListActivitiesQuery);
  },

  /** Trending = most joins/saves among upcoming public activities. */
  async trending(page: number, pageSize: number) {
    const data = await prisma.activity.findMany({
      where: { deletedAt: null, status: 'PUBLISHED', visibility: 'PUBLIC', startsAt: { gte: new Date() } },
      include: cardInclude,
      orderBy: [{ participants: { _count: 'desc' } }, { startsAt: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { data, page, pageSize };
  },

  /** Feed = activities from people the user follows + upcoming public ones. */
  async feed(userId: string, page: number, pageSize: number) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    const where: Prisma.ActivityWhereInput = {
      deletedAt: null,
      status: 'PUBLISHED',
      startsAt: { gte: new Date() },
      OR: [
        { visibility: 'PUBLIC' },
        { visibility: 'FOLLOWERS', hostId: { in: followingIds } },
      ],
    };
    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: cardInclude,
        orderBy: { startsAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activity.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  },
};
