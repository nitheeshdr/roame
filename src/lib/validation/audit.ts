import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const auditActionSchema = z.enum([
  'CREATE',
  'UPDATE',
  'DELETE',
  'SOFT_DELETE',
  'RESTORE',
  'LOGIN',
  'LOGOUT',
  'ROLE_CHANGE',
  'STATUS_CHANGE',
]);
export type AuditActionInput = z.infer<typeof auditActionSchema>;

export const auditLogQuerySchema = paginationQuerySchema.extend({
  action: auditActionSchema.optional(),
  entityType: z.string().trim().max(80).optional(),
  actorId: z.string().optional(),
});
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;

/** Input the audit service accepts when recording an event. */
export const recordAuditSchema = z.object({
  actorId: z.string().nullable().optional(),
  action: auditActionSchema,
  entityType: z.string().min(1),
  entityId: z.string().optional(),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});
export type RecordAuditInput = z.infer<typeof recordAuditSchema>;
