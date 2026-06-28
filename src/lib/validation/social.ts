import { z } from 'zod';

/** Create a review of an activity, venue, or host. */
export const createReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(2000).optional(),
    activityId: z.string().optional(),
    venueId: z.string().optional(),
    subjectId: z.string().optional(),
  })
  .refine((v) => v.activityId || v.venueId || v.subjectId, {
    message: 'A review must target an activity, venue, or user.',
  });
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(2000).nullable().optional(),
});
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

/** File a report against a user/activity/message/venue/review. */
export const createReportSchema = z.object({
  targetType: z.enum(['USER', 'ACTIVITY', 'MESSAGE', 'VENUE', 'REVIEW']),
  targetId: z.string().min(1),
  reportedUserId: z.string().optional(),
  reason: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const resolveReportSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'RESOLVED', 'DISMISSED']),
  action: z
    .enum(['WARN', 'REMOVE_CONTENT', 'SUSPEND_USER', 'BAN_USER', 'DISMISS', 'RESTORE'])
    .optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
