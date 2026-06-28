import { prisma, type Prisma } from '@/lib/db';
import type {
  SessionUser,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UserListQuery,
} from '@/lib/validation';
import { ForbiddenError, NotFoundError, buildPageResult, ok, type Result } from '@/lib/utils';
import { auditService } from './audit-service';

const listUserSelect = {
  id: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  lastLoginAt: true,
  deletedAt: true,
  profile: { select: { displayName: true, username: true, avatarUrl: true, city: true } },
  trustScore: { select: { score: true, level: true } },
} satisfies Prisma.UserSelect;

export const userService = {
  async list(query: UserListQuery) {
    const where: Prisma.UserWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
              { profile: { displayName: { contains: query.search, mode: 'insensitive' } } },
              { profile: { username: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: listUserSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return buildPageResult(rows, total, { page: query.page, pageSize: query.pageSize });
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: listUserSelect });
    if (!user) throw new NotFoundError('User not found.');
    return user;
  },

  async updateRole(
    actor: SessionUser,
    id: string,
    input: UpdateUserRoleInput,
  ): Promise<Result<{ id: string; role: string }, never>> {
    // Only SUPERADMINs may grant admin-level roles.
    if ((input.role === 'ADMIN' || input.role === 'SUPERADMIN') && actor.role !== 'SUPERADMIN') {
      throw new ForbiddenError('Only a superadmin can assign admin roles.');
    }
    const before = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!before) throw new NotFoundError('User not found.');

    const updated = await prisma.user.update({ where: { id }, data: { role: input.role } });
    await auditService.record({
      actorId: actor.id,
      action: 'ROLE_CHANGE',
      entityType: 'User',
      entityId: id,
      before: { role: before.role },
      after: { role: updated.role },
    });
    return ok({ id: updated.id, role: updated.role });
  },

  async updateStatus(
    actor: SessionUser,
    id: string,
    input: UpdateUserStatusInput,
  ): Promise<Result<{ id: string; status: string }, never>> {
    const before = await prisma.user.findUnique({ where: { id }, select: { status: true } });
    if (!before) throw new NotFoundError('User not found.');

    const updated = await prisma.user.update({ where: { id }, data: { status: input.status } });
    await auditService.record({
      actorId: actor.id,
      action: 'STATUS_CHANGE',
      entityType: 'User',
      entityId: id,
      before: { status: before.status },
      after: { status: updated.status, reason: input.reason },
    });
    return ok({ id: updated.id, status: updated.status });
  },

  async softDelete(actor: SessionUser, id: string): Promise<Result<{ id: string }, never>> {
    if (actor.id === id) throw new ForbiddenError('You cannot delete your own account here.');
    const before = await prisma.user.findUnique({ where: { id }, select: { deletedAt: true } });
    if (!before) throw new NotFoundError('User not found.');

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DEACTIVATED' },
    });
    await auditService.record({
      actorId: actor.id,
      action: 'SOFT_DELETE',
      entityType: 'User',
      entityId: id,
    });
    return ok({ id });
  },

  async restore(actor: SessionUser, id: string): Promise<Result<{ id: string }, never>> {
    await prisma.user.update({ where: { id }, data: { deletedAt: null, status: 'ACTIVE' } });
    await auditService.record({
      actorId: actor.id,
      action: 'RESTORE',
      entityType: 'User',
      entityId: id,
    });
    return ok({ id });
  },

  /** Aggregate counts for the dashboard overview cards. */
  async stats() {
    const [total, active, suspended, banned, admins, activities, audits] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { status: 'BANNED' } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPERADMIN'] } } }),
      prisma.activity.count({ where: { deletedAt: null } }),
      prisma.auditLog.count(),
    ]);
    return { total, active, suspended, banned, admins, activities, audits };
  },
};
