import { prisma } from '@/lib/db';
import type {
  CreateAnnouncementInput,
  CreateFaqInput,
  CreateSupportTicketInput,
  SessionUser,
  UpdateAnnouncementInput,
  UpdateFaqInput,
} from '@/lib/validation';
import { NotFoundError, ok, type Result } from '@/lib/utils';

export const contentService = {
  // ── Public catalog ──────────────────────────────────────────────────────
  categories() {
    return prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  },
  interests() {
    return prisma.interest.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  },
  async cities() {
    const rows = await prisma.activity.groupBy({
      by: ['city'],
      where: { city: { not: null }, deletedAt: null },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 50,
    });
    return rows.filter((r) => r.city).map((r) => ({ city: r.city, count: r._count.city }));
  },
  faqs() {
    return prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  },
  adminFaqs() {
    return prisma.faq.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] });
  },
  announcements() {
    return prisma.announcement.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
  },

  // ── Admin CMS: announcements ───────────────────────────────────────────────
  async createAnnouncement(authorId: string, input: CreateAnnouncementInput) {
    return ok(
      await prisma.announcement.create({
        data: { ...input, authorId, publishedAt: input.isPublished ? new Date() : null },
      }),
    );
  },
  async updateAnnouncement(id: string, input: UpdateAnnouncementInput) {
    const exists = await prisma.announcement.findFirst({ where: { id, deletedAt: null } });
    if (!exists) throw new NotFoundError('Announcement not found.');
    return ok(
      await prisma.announcement.update({
        where: { id },
        data: { ...input, ...(input.isPublished && !exists.publishedAt ? { publishedAt: new Date() } : {}) },
      }),
    );
  },
  async deleteAnnouncement(id: string): Promise<Result<{ id: string }, never>> {
    await prisma.announcement.update({ where: { id }, data: { deletedAt: new Date() } });
    return ok({ id });
  },
  adminAnnouncements() {
    return prisma.announcement.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  },

  // ── Admin CMS: FAQs ─────────────────────────────────────────────────────────
  async createFaq(input: CreateFaqInput) {
    return ok(await prisma.faq.create({ data: input }));
  },
  async updateFaq(id: string, input: UpdateFaqInput) {
    const exists = await prisma.faq.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('FAQ not found.');
    return ok(await prisma.faq.update({ where: { id }, data: input }));
  },
  async deleteFaq(id: string): Promise<Result<{ id: string }, never>> {
    await prisma.faq.delete({ where: { id } });
    return ok({ id });
  },

  // ── Support tickets ─────────────────────────────────────────────────────────
  async createTicket(userId: string, input: CreateSupportTicketInput) {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject: input.subject,
        priority: input.priority,
        messages: { create: { authorId: userId, body: input.message } },
      },
    });
    return ok(ticket);
  },
  adminTickets(status?: string) {
    return prisma.supportTicket.findMany({
      where: status ? { status: status as never } : {},
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { profile: { select: { displayName: true } } } } },
    });
  },
  async updateTicket(actor: SessionUser, id: string, status: string): Promise<Result<{ id: string }, never>> {
    const exists = await prisma.supportTicket.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Ticket not found.');
    await prisma.supportTicket.update({
      where: { id },
      data: { status: status as never, closedAt: status === 'CLOSED' ? new Date() : null },
    });
    return ok({ id });
  },
};
