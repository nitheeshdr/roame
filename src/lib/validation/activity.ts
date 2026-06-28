import { z } from 'zod';
import { latLngSchema, paginationQuerySchema } from './common';

export const activityVisibilitySchema = z.enum([
  'PUBLIC',
  'FOLLOWERS',
  'INVITE_ONLY',
  'PRIVATE',
]);

export const createActivitySchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(1).max(4000),
    categoryId: z.string().optional(),
    venueId: z.string().optional(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date().optional(),
    capacity: z.number().int().positive().max(100000).optional(),
    waitlistEnabled: z.boolean().default(true),
    visibility: activityVisibilitySchema.default('PUBLIC'),
    isPaid: z.boolean().default(false),
    priceCents: z.number().int().nonnegative().optional(),
    currency: z.string().length(3).default('INR'),
    location: latLngSchema.optional(),
    addressLine: z.string().trim().max(240).optional(),
    city: z.string().trim().max(80).optional(),
    checkinRadiusM: z.number().int().min(20).max(5000).default(150),
    tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  })
  .refine((v) => !v.endsAt || v.endsAt > v.startsAt, {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  })
  .refine((v) => !v.isPaid || (v.priceCents ?? 0) > 0, {
    message: 'priceCents is required for a paid activity',
    path: ['priceCents'],
  });
export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(1).max(4000).optional(),
  categoryId: z.string().nullable().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  capacity: z.number().int().positive().max(100000).nullable().optional(),
  waitlistEnabled: z.boolean().optional(),
  visibility: activityVisibilitySchema.optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED']).optional(),
  addressLine: z.string().trim().max(240).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  location: latLngSchema.optional(),
});
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export const listActivitiesQuerySchema = paginationQuerySchema.extend({
  categoryId: z.string().optional(),
  city: z.string().trim().max(80).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED']).optional(),
  q: z.string().trim().max(120).optional(),
});
export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;

export const nearbyActivitiesQuerySchema = paginationQuerySchema.extend({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(100).default(10),
  categoryId: z.string().optional(),
});
export type NearbyActivitiesQuery = z.infer<typeof nearbyActivitiesQuerySchema>;

export const searchActivitiesQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(120),
  categoryId: z.string().optional(),
  city: z.string().trim().max(80).optional(),
});
export type SearchActivitiesQuery = z.infer<typeof searchActivitiesQuerySchema>;

export const checkinSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  method: z.enum(['GEO', 'QR', 'MANUAL']).default('GEO'),
});
export type CheckinInput = z.infer<typeof checkinSchema>;
