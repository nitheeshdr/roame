import { prisma } from '@/lib/db';
import type { RecordAuditInput } from '@/lib/validation';

/**
 * Audit service — the single path through which mutations record who did what.
 * Kept dependency-light so any service or route can call it.
 */
export const auditService = {
  async record(input: RecordAuditInput): Promise<void> {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: toJson(input.before),
        after: toJson(input.after),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  },

  async list(params: {
    page: number;
    pageSize: number;
    action?: string;
    entityType?: string;
    actorId?: string;
  }) {
    const where = {
      ...(params.action ? { action: params.action as never } : {}),
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.actorId ? { actorId: params.actorId } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: { actor: { select: { id: true, email: true, profile: { select: { displayName: true } } } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { rows, total };
  },
};

/** Prisma's Json columns reject `undefined`; normalize to null. */
function toJson(value: unknown) {
  return value === undefined ? undefined : (value as object);
}
