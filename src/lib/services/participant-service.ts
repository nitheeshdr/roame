import { prisma } from '@/lib/db';
import type { CheckinInput } from '@/lib/validation';
import { ConflictError, ForbiddenError, NotFoundError, ok, type Result } from '@/lib/utils';
import { setGeographyPoint } from '@/lib/db-geo';

async function joinedCount(activityId: string): Promise<number> {
  return prisma.activityParticipant.count({ where: { activityId, status: 'JOINED' } });
}

export const participantService = {
  /** Join an activity, or be added to the waitlist if it is full. */
  async join(userId: string, activityId: string): Promise<Result<{ status: string; position?: number }, never>> {
    const activity = await prisma.activity.findFirst({
      where: { id: activityId, deletedAt: null },
      select: { id: true, capacity: true, waitlistEnabled: true, status: true },
    });
    if (!activity) throw new NotFoundError('Activity not found.');
    if (activity.status !== 'PUBLISHED') throw new ConflictError('This activity is not open to join.');

    const existing = await prisma.activityParticipant.findUnique({
      where: { activityId_userId: { activityId, userId } },
    });
    if (existing && existing.status === 'JOINED') throw new ConflictError('Already joined.');

    const full = activity.capacity != null && (await joinedCount(activityId)) >= activity.capacity;
    if (full) {
      if (!activity.waitlistEnabled) throw new ConflictError('This activity is full.');
      const position = (await prisma.activityWaitlist.count({ where: { activityId } })) + 1;
      await prisma.activityWaitlist.upsert({
        where: { activityId_userId: { activityId, userId } },
        update: { status: 'WAITING' },
        create: { activityId, userId, position, status: 'WAITING' },
      });
      return ok({ status: 'WAITLISTED', position });
    }

    await prisma.activityParticipant.upsert({
      where: { activityId_userId: { activityId, userId } },
      update: { status: 'JOINED', leftAt: null },
      create: { activityId, userId, status: 'JOINED', role: 'ATTENDEE' },
    });
    await prisma.activityMetric.updateMany({ where: { activityId }, data: { joins: { increment: 1 } } });
    return ok({ status: 'JOINED' });
  },

  /** Leave an activity; promote the first waitlisted user if a slot frees up. */
  async leave(userId: string, activityId: string): Promise<Result<{ ok: true }, never>> {
    const participant = await prisma.activityParticipant.findUnique({
      where: { activityId_userId: { activityId, userId } },
    });
    if (!participant) throw new NotFoundError('You are not a participant.');
    if (participant.role === 'HOST') throw new ForbiddenError('The host cannot leave their own activity.');

    await prisma.activityParticipant.update({
      where: { activityId_userId: { activityId, userId } },
      data: { status: 'LEFT', leftAt: new Date() },
    });

    // Promote the next person on the waitlist.
    const next = await prisma.activityWaitlist.findFirst({
      where: { activityId, status: 'WAITING' },
      orderBy: { position: 'asc' },
    });
    if (next) {
      await prisma.$transaction([
        prisma.activityWaitlist.update({
          where: { id: next.id },
          data: { status: 'PROMOTED', promotedAt: new Date() },
        }),
        prisma.activityParticipant.upsert({
          where: { activityId_userId: { activityId, userId: next.userId } },
          update: { status: 'JOINED', leftAt: null },
          create: { activityId, userId: next.userId, status: 'JOINED', role: 'ATTENDEE' },
        }),
        prisma.notification.create({
          data: {
            userId: next.userId,
            type: 'WAITLIST_PROMOTED',
            title: "You're in!",
            body: 'A spot opened up and you have been promoted from the waitlist.',
            data: { activityId },
          },
        }),
      ]);
    }
    return ok({ ok: true });
  },

  async listParticipants(activityId: string) {
    const participants = await prisma.activityParticipant.findMany({
      where: { activityId, status: { in: ['JOINED', 'ATTENDED'] } },
      orderBy: { joinedAt: 'asc' },
      include: { user: { select: { id: true, profile: { select: { displayName: true, username: true, avatarUrl: true } } } } },
    });
    return participants;
  },

  /** Check in at the venue; validates proximity for GEO check-ins. */
  async checkin(userId: string, activityId: string, input: CheckinInput): Promise<Result<{ distanceM: number | null }, never>> {
    const participant = await prisma.activityParticipant.findUnique({
      where: { activityId_userId: { activityId, userId } },
    });
    if (!participant || participant.status === 'LEFT') {
      throw new ForbiddenError('Join the activity before checking in.');
    }
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { checkinRadiusM: true },
    });
    if (!activity) throw new NotFoundError('Activity not found.');

    let distanceM: number | null = null;
    if (input.method === 'GEO' && input.lat != null && input.lng != null) {
      const rows = await prisma.$queryRawUnsafe<{ distance_m: number | null }[]>(
        `SELECT ST_Distance("location", ST_GeographyFromText($1)) AS distance_m
           FROM activities WHERE id = $2`,
        `SRID=4326;POINT(${input.lng} ${input.lat})`,
        activityId,
      );
      distanceM = rows[0]?.distance_m != null ? Math.round(rows[0].distance_m) : null;
      if (distanceM != null && distanceM > activity.checkinRadiusM) {
        throw new ConflictError(`You are too far from the venue to check in (${distanceM}m).`);
      }
    }

    await prisma.activityParticipant.update({
      where: { activityId_userId: { activityId, userId } },
      data: { status: 'ATTENDED' },
    });
    const checkin = await prisma.activityCheckin.upsert({
      where: { activityId_userId: { activityId, userId } },
      update: { method: input.method, distanceM },
      create: { activityId, userId, method: input.method, distanceM },
    });
    if (input.lat != null && input.lng != null) {
      await setGeographyPoint('activity_checkins', 'location', checkin.id, { lat: input.lat, lng: input.lng });
    }
    await prisma.activityMetric.updateMany({ where: { activityId }, data: { checkins: { increment: 1 } } });
    return ok({ distanceM });
  },

  async joinWaitlist(userId: string, activityId: string): Promise<Result<{ position: number }, never>> {
    const activity = await prisma.activity.findFirst({ where: { id: activityId, deletedAt: null }, select: { id: true } });
    if (!activity) throw new NotFoundError('Activity not found.');
    const position = (await prisma.activityWaitlist.count({ where: { activityId } })) + 1;
    await prisma.activityWaitlist.upsert({
      where: { activityId_userId: { activityId, userId } },
      update: { status: 'WAITING' },
      create: { activityId, userId, position, status: 'WAITING' },
    });
    return ok({ position });
  },

  async leaveWaitlist(userId: string, activityId: string): Promise<Result<{ ok: true }, never>> {
    await prisma.activityWaitlist.updateMany({
      where: { activityId, userId },
      data: { status: 'CANCELLED' },
    });
    return ok({ ok: true });
  },
};
