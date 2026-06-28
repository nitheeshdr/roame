import { z } from 'zod';
import { latLngSchema, paginationQuerySchema } from './common';

/**
 * Activity schemas — STUB for Milestone 1. The shapes below are intentionally
 * minimal; M2 (Activities vertical) hardens validation (capacity vs waitlist,
 * paid pricing rules, visibility/invite constraints, time-window checks).
 */

export const createActivitySchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(4000),
  categoryId: z.string().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  capacity: z.number().int().positive().optional(),
  visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'INVITE_ONLY', 'PRIVATE']).default('PUBLIC'),
  location: latLngSchema.optional(),
  addressLine: z.string().trim().max(240).optional(),
  city: z.string().trim().max(80).optional(),
  // TODO(M2): isPaid/priceCents coupling, tags, media, venueId.
});
export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const nearbyActivitiesQuerySchema = paginationQuerySchema.extend({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(100).default(10),
  categoryId: z.string().optional(),
});
export type NearbyActivitiesQuery = z.infer<typeof nearbyActivitiesQuerySchema>;
