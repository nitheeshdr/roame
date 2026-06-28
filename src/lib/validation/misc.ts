import { z } from 'zod';
import { paginationQuerySchema } from './common';

/** Analytics event ingestion. */
export const analyticsEventSchema = z.object({
  name: z.string().trim().min(1).max(80),
  props: z.record(z.unknown()).optional(),
  sessionId: z.string().max(120).optional(),
});
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

/** Support ticket. */
export const createSupportTicketSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(1).max(4000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;

/** Admin CMS: announcements + FAQs. */
export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(8000),
  audience: z.enum(['ALL', 'USERS', 'HOSTS', 'ADMINS']).default('ALL'),
  isPublished: z.boolean().default(false),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export const updateAnnouncementSchema = createAnnouncementSchema.partial();
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

export const createFaqSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(1).max(4000),
  category: z.string().trim().max(80).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type CreateFaqInput = z.infer<typeof createFaqSchema>;

export const updateFaqSchema = createFaqSchema.partial();
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;

/** Chat */
export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000).optional(),
  type: z.enum(['TEXT', 'IMAGE', 'LOCATION']).default('TEXT'),
  attachmentUrl: z.string().url().optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const reactMessageSchema = z.object({ emoji: z.string().min(1).max(16) });
export type ReactMessageInput = z.infer<typeof reactMessageSchema>;

export const messagesQuerySchema = paginationQuerySchema;
