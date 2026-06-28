import { prisma } from '@/lib/db';
import type { ReactMessageInput, SendMessageInput } from '@/lib/validation';
import { ForbiddenError, NotFoundError, buildPageResult, ok, type Result } from '@/lib/utils';

async function assertMember(conversationId: string, userId: string) {
  const member = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!member || member.leftAt) throw new ForbiddenError('You are not a member of this conversation.');
  return member;
}

export const chatService = {
  async listChats(userId: string) {
    const memberships = await prisma.conversationParticipant.findMany({
      where: { userId, leftAt: null },
      include: {
        conversation: {
          include: {
            activity: { select: { id: true, title: true } },
            messages: { take: 1, orderBy: { createdAt: 'desc' } },
            _count: { select: { participants: true } },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });
    return memberships.map((m) => ({
      conversationId: m.conversationId,
      lastReadAt: m.lastReadAt,
      conversation: m.conversation,
    }));
  },

  /** Resolve (and lazily join) the chat for an activity the user participates in. */
  async getActivityChat(userId: string, activityId: string) {
    const conversation = await prisma.conversation.findUnique({ where: { activityId } });
    if (!conversation) throw new NotFoundError('Chat not found.');
    const participant = await prisma.activityParticipant.findUnique({
      where: { activityId_userId: { activityId, userId } },
    });
    if (!participant || participant.status === 'LEFT') {
      throw new ForbiddenError('Join the activity to access its chat.');
    }
    await prisma.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId: conversation.id, userId } },
      update: { leftAt: null },
      create: { conversationId: conversation.id, userId },
    });
    return conversation;
  },

  async listMessages(userId: string, activityId: string, page: number, pageSize: number) {
    const conversation = await prisma.conversation.findUnique({ where: { activityId } });
    if (!conversation) throw new NotFoundError('Chat not found.');
    await assertMember(conversation.id, userId);
    const where = { conversationId: conversation.id, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          sender: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } } },
          reactions: true,
          _count: { select: { reads: true } },
        },
      }),
      prisma.message.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  },

  async send(userId: string, activityId: string, input: SendMessageInput): Promise<Result<unknown, never>> {
    const conversation = await this.getActivityChat(userId, activityId);
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        type: input.type,
        body: input.body,
        attachments: input.attachmentUrl
          ? { create: { url: input.attachmentUrl, type: input.type === 'IMAGE' ? 'IMAGE' : 'IMAGE' } }
          : undefined,
      },
      include: { attachments: true },
    });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
    return ok(message);
  },

  async edit(userId: string, messageId: string, body: string): Promise<Result<unknown, never>> {
    const message = await prisma.message.findFirst({ where: { id: messageId, deletedAt: null } });
    if (!message) throw new NotFoundError('Message not found.');
    if (message.senderId !== userId) throw new ForbiddenError('You can only edit your own messages.');
    return ok(await prisma.message.update({ where: { id: messageId }, data: { body, editedAt: new Date() } }));
  },

  async remove(userId: string, messageId: string): Promise<Result<{ id: string }, never>> {
    const message = await prisma.message.findFirst({ where: { id: messageId, deletedAt: null } });
    if (!message) throw new NotFoundError('Message not found.');
    if (message.senderId !== userId) throw new ForbiddenError('You can only delete your own messages.');
    await prisma.message.update({ where: { id: messageId }, data: { deletedAt: new Date(), body: null } });
    return ok({ id: messageId });
  },

  async react(userId: string, messageId: string, input: ReactMessageInput): Promise<Result<{ ok: true }, never>> {
    const message = await prisma.message.findFirst({ where: { id: messageId, deletedAt: null } });
    if (!message) throw new NotFoundError('Message not found.');
    await assertMember(message.conversationId, userId);
    await prisma.messageReaction.upsert({
      where: { messageId_userId_emoji: { messageId, userId, emoji: input.emoji } },
      update: {},
      create: { messageId, userId, emoji: input.emoji },
    });
    return ok({ ok: true });
  },

  async markRead(userId: string, messageId: string): Promise<Result<{ ok: true }, never>> {
    const message = await prisma.message.findFirst({ where: { id: messageId, deletedAt: null } });
    if (!message) throw new NotFoundError('Message not found.');
    await assertMember(message.conversationId, userId);
    await prisma.messageRead.upsert({
      where: { messageId_userId: { messageId, userId } },
      update: { readAt: new Date() },
      create: { messageId, userId },
    });
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: message.conversationId, userId } },
      data: { lastReadAt: new Date() },
    });
    return ok({ ok: true });
  },
};
