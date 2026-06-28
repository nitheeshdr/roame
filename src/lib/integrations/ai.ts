import { prisma } from '@/lib/db';
import { NotImplementedError } from '@/lib/utils';

/**
 * AI adapter (OpenAI/Gemini). Recommendations fall back to a heuristic (trending
 * upcoming public activities) so the endpoint is always useful; summarize and
 * moderate require a configured provider and return 501 until then.
 */
const isConfigured =
  (!!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-key') ||
  (!!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-key');

export const aiAdapter = {
  isConfigured,

  /** Heuristic recommendations (no AI key required). */
  async recommendActivities(limit = 10) {
    const activities = await prisma.activity.findMany({
      where: { deletedAt: null, status: 'PUBLISHED', visibility: 'PUBLIC', startsAt: { gte: new Date() } },
      orderBy: [{ participants: { _count: 'desc' } }, { startsAt: 'asc' }],
      take: limit,
      include: { category: { select: { name: true, icon: true } } },
    });
    return { source: isConfigured ? 'ai' : 'heuristic', activities };
  },

  async summarize(_text: string): Promise<{ summary: string }> {
    if (!isConfigured) {
      throw new NotImplementedError('AI summarization is not configured. Set OPENAI_API_KEY or GEMINI_API_KEY.');
    }
    // Wiring point for the real model call.
    return { summary: '' };
  },

  async moderate(_text: string): Promise<{ flagged: boolean; labels: string[] }> {
    if (!isConfigured) {
      throw new NotImplementedError('AI moderation is not configured. Set OPENAI_API_KEY or GEMINI_API_KEY.');
    }
    return { flagged: false, labels: [] };
  },
};
