import { prisma } from '@/lib/db';
import type { CreateReviewInput, UpdateReviewInput } from '@/lib/validation';
import { ConflictError, ForbiddenError, NotFoundError, buildPageResult, ok, type Result } from '@/lib/utils';

export const reviewService = {
  async create(authorId: string, input: CreateReviewInput): Promise<Result<unknown, never>> {
    if (input.subjectId && input.subjectId === authorId) {
      throw new ConflictError('You cannot review yourself.');
    }
    // One review per author per target.
    const dup = await prisma.review.findFirst({
      where: {
        authorId,
        deletedAt: null,
        activityId: input.activityId ?? undefined,
        venueId: input.venueId ?? undefined,
        subjectId: input.subjectId ?? undefined,
      },
    });
    if (dup) throw new ConflictError('You have already reviewed this.');

    const review = await prisma.review.create({
      data: {
        authorId,
        rating: input.rating,
        comment: input.comment,
        activityId: input.activityId,
        venueId: input.venueId,
        subjectId: input.subjectId,
      },
    });
    if (input.subjectId) {
      await prisma.notification.create({
        data: { userId: input.subjectId, type: 'REVIEW_RECEIVED', title: 'You received a review', data: { reviewId: review.id } },
      });
    }
    return ok(review);
  },

  async listForUser(userId: string, page: number, pageSize: number) {
    const where = { subjectId: userId, deletedAt: null };
    const [data, total, agg] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: { select: { profile: { select: { displayName: true, avatarUrl: true } } } }, response: true },
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({ where, _avg: { rating: true } }),
    ]);
    return { ...buildPageResult(data, total, { page, pageSize }), averageRating: agg._avg.rating ?? null };
  },

  async update(authorId: string, id: string, input: UpdateReviewInput): Promise<Result<unknown, never>> {
    const review = await prisma.review.findFirst({ where: { id, deletedAt: null } });
    if (!review) throw new NotFoundError('Review not found.');
    if (review.authorId !== authorId) throw new ForbiddenError('You can only edit your own review.');
    const updated = await prisma.review.update({ where: { id }, data: input });
    return ok(updated);
  },

  async remove(authorId: string, id: string, isAdmin = false): Promise<Result<{ id: string }, never>> {
    const review = await prisma.review.findFirst({ where: { id, deletedAt: null } });
    if (!review) throw new NotFoundError('Review not found.');
    if (review.authorId !== authorId && !isAdmin) throw new ForbiddenError('You can only delete your own review.');
    await prisma.review.update({ where: { id }, data: { deletedAt: new Date() } });
    return ok({ id });
  },
};
