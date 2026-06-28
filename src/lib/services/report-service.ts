import { prisma, type Prisma } from '@/lib/db';
import type { CreateReportInput, ResolveReportInput, SessionUser } from '@/lib/validation';
import { NotFoundError, buildPageResult, ok, type Result } from '@/lib/utils';
import { auditService } from './audit-service';

export const reportService = {
  async create(reporterId: string, input: CreateReportInput): Promise<Result<{ id: string }, never>> {
    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType: input.targetType,
        targetId: input.targetId,
        reportedUserId: input.reportedUserId,
        reason: input.reason,
        description: input.description,
        queueItem: { create: { status: 'PENDING' } },
      },
    });
    return ok({ id: report.id });
  },

  async mine(reporterId: string, page: number, pageSize: number) {
    const where = { reporterId };
    const [data, total] = await Promise.all([
      prisma.report.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.report.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  },

  // ── Admin / moderation ────────────────────────────────────────────────────
  async adminList(status: string | undefined, page: number, pageSize: number) {
    const where: Prisma.ReportWhereInput = status ? { status: status as never } : {};
    const [data, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          reporter: { select: { id: true, profile: { select: { displayName: true } } } },
          reportedUser: { select: { id: true, profile: { select: { displayName: true } } } },
        },
      }),
      prisma.report.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  },

  async resolve(actor: SessionUser, id: string, input: ResolveReportInput): Promise<Result<{ id: string }, never>> {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundError('Report not found.');

    await prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id },
        data: {
          status: input.status,
          resolvedAt: input.status === 'RESOLVED' || input.status === 'DISMISSED' ? new Date() : null,
        },
      });
      await tx.moderationQueueItem.updateMany({
        where: { reportId: id },
        data: { status: input.status === 'UNDER_REVIEW' ? 'IN_REVIEW' : 'ACTIONED', assigneeId: actor.id },
      });
      if (input.action) {
        await tx.moderationAction.create({
          data: {
            reportId: id,
            moderatorId: actor.id,
            type: input.action,
            targetType: report.targetType,
            targetId: report.targetId,
            notes: input.notes,
          },
        });
        // Apply user-level actions.
        if (report.reportedUserId && (input.action === 'SUSPEND_USER' || input.action === 'BAN_USER')) {
          await tx.user.update({
            where: { id: report.reportedUserId },
            data: { status: input.action === 'BAN_USER' ? 'BANNED' : 'SUSPENDED' },
          });
        }
      }
    });

    await auditService.record({
      actorId: actor.id,
      action: 'UPDATE',
      entityType: 'Report',
      entityId: id,
      after: { status: input.status, action: input.action },
    });
    return ok({ id });
  },
};
