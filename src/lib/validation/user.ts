import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const userRoleSchema = z.enum(['USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN']);
export const userStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'BANNED',
  'DEACTIVATED',
]);

/** Admin: list/filter users. */
export const userListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  includeDeleted: z.coerce.boolean().default(false),
});
export type UserListQuery = z.infer<typeof userListQuerySchema>;

/** Admin: change a user's role. */
export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

/** Admin: change a user's status (suspend/ban/reactivate). */
export const updateUserStatusSchema = z.object({
  status: userStatusSchema,
  reason: z.string().trim().max(500).optional(),
});
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

/** Profile editing (used by mobile later; defined now for reuse). */
export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,20}$/, '3–20 chars: lowercase, numbers, underscore')
    .optional(),
  bio: z.string().trim().max(280).optional(),
  city: z.string().trim().max(80).optional(),
  avatarUrl: z.string().url().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY', 'OTHER']).optional(),
  isPrivate: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Replace the user's interests by slug. */
export const updateInterestsSchema = z.object({
  interests: z.array(z.string().min(1)).max(30),
});
export type UpdateInterestsInput = z.infer<typeof updateInterestsSchema>;

/** User app settings. */
export const updateSettingsSchema = z.object({
  language: z.string().min(2).max(8).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  discoveryRadiusKm: z.number().int().min(1).max(100).optional(),
  showOnlineStatus: z.boolean().optional(),
  allowMessagesFrom: z.enum(['everyone', 'following', 'none']).optional(),
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
});
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

/** Update the user's home location (PostGIS point). */
export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().trim().max(80).optional(),
});
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
