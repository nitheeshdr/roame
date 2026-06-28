import { prisma, type Prisma } from '@/lib/db';
import type {
  CreateBookingInput,
  CreateVenueInput,
  ListVenuesQuery,
  SubscribeInput,
  UpdateVenueInput,
} from '@/lib/validation';
import { ConflictError, ForbiddenError, NotFoundError, buildPageResult, ok, type Result } from '@/lib/utils';
import { setGeographyPoint } from '@/lib/db-geo';

export const venueService = {
  async list(query: ListVenuesQuery) {
    const where: Prisma.VenueWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.venue.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.venue.count({ where }),
    ]);
    return buildPageResult(data, total, query);
  },

  async get(id: string) {
    const venue = await prisma.venue.findFirst({
      where: { id, deletedAt: null },
      include: { media: true, hours: true },
    });
    if (!venue) throw new NotFoundError('Venue not found.');
    return venue;
  },

  async create(ownerId: string, input: CreateVenueInput) {
    const { location, ...data } = input;
    const venue = await prisma.venue.create({ data: { ...data, ownerId, status: 'PENDING' } });
    if (location) await setGeographyPoint('venues', 'location', venue.id, location);
    return ok(venue);
  },

  async update(actorId: string, id: string, input: UpdateVenueInput, isAdmin = false): Promise<Result<unknown, never>> {
    const venue = await prisma.venue.findFirst({ where: { id, deletedAt: null } });
    if (!venue) throw new NotFoundError('Venue not found.');
    if (venue.ownerId !== actorId && !isAdmin) throw new ForbiddenError('Only the owner can edit this venue.');
    // Only admins may change moderation status.
    const { location, status, ...rest } = input;
    const data: Prisma.VenueUpdateInput = { ...rest, ...(isAdmin && status ? { status } : {}) };
    const updated = await prisma.venue.update({ where: { id }, data });
    if (location) await setGeographyPoint('venues', 'location', id, location);
    return ok(updated);
  },

  async remove(actorId: string, id: string, isAdmin = false): Promise<Result<{ id: string }, never>> {
    const venue = await prisma.venue.findFirst({ where: { id, deletedAt: null } });
    if (!venue) throw new NotFoundError('Venue not found.');
    if (venue.ownerId !== actorId && !isAdmin) throw new ForbiddenError('Only the owner can delete this venue.');
    await prisma.venue.update({ where: { id }, data: { deletedAt: new Date(), status: 'CLOSED' } });
    return ok({ id });
  },
};

export const bookingService = {
  async create(userId: string, input: CreateBookingInput): Promise<Result<unknown, never>> {
    const venue = await prisma.venue.findFirst({ where: { id: input.venueId, deletedAt: null, status: 'ACTIVE' } });
    if (!venue) throw new NotFoundError('Venue not found or not bookable.');
    const booking = await prisma.booking.create({
      data: {
        userId,
        venueId: input.venueId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        partySize: input.partySize,
        status: 'CONFIRMED', // payments wired in a later milestone
      },
    });
    return ok(booking);
  },

  async list(userId: string, page: number, pageSize: number) {
    const where = { userId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { startsAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { venue: { select: { name: true, city: true } } },
      }),
      prisma.booking.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  },

  async cancel(userId: string, id: string): Promise<Result<{ id: string }, never>> {
    const booking = await prisma.booking.findFirst({ where: { id, userId, deletedAt: null } });
    if (!booking) throw new NotFoundError('Booking not found.');
    if (booking.status === 'CANCELLED') throw new ConflictError('Booking is already cancelled.');
    await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
    return ok({ id });
  },
};

export const subscriptionService = {
  plans() {
    return prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { priceCents: 'asc' } });
  },

  async current(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async subscribe(userId: string, input: SubscribeInput): Promise<Result<unknown, never>> {
    const plan = await prisma.subscriptionPlan.findFirst({ where: { slug: input.planSlug, isActive: true } });
    if (!plan) throw new NotFoundError('Plan not found.');
    const existing = await this.current(userId);
    if (existing) throw new ConflictError('You already have an active subscription.');
    const now = new Date();
    const end = new Date(now);
    if (plan.interval === 'YEARLY') end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);
    // Free plan activates immediately; paid plans would go through Razorpay first.
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: plan.priceCents === 0 ? 'ACTIVE' : 'TRIALING',
        currentPeriodStart: now,
        currentPeriodEnd: end,
      },
      include: { plan: true },
    });
    return ok(subscription);
  },

  async cancel(userId: string): Promise<Result<{ ok: true }, never>> {
    const current = await this.current(userId);
    if (!current) throw new NotFoundError('No active subscription.');
    await prisma.subscription.update({
      where: { id: current.id },
      data: { cancelAtPeriodEnd: true, status: 'CANCELLED' },
    });
    return ok({ ok: true });
  },
};
