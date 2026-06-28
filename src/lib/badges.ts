import { prisma } from '@/lib/db';

/**
 * Badges are derived from user metrics + trust score (no dedicated table needed
 * in Milestone 1). The catalog is the source of truth; "earned" is computed.
 */
export interface BadgeDef {
  slug: string;
  name: string;
  description: string;
  icon: string;
  /** Returns true if the user has earned this badge. */
  earned: (m: { hosted: number; joined: number; checkins: number; followers: number; trust: number }) => boolean;
}

export const BADGES: BadgeDef[] = [
  { slug: 'newcomer', name: 'Newcomer', description: 'Joined Roame', icon: '🌱', earned: () => true },
  { slug: 'first-host', name: 'First Host', description: 'Hosted your first activity', icon: '🎤', earned: (m) => m.hosted >= 1 },
  { slug: 'super-host', name: 'Super Host', description: 'Hosted 10+ activities', icon: '🏆', earned: (m) => m.hosted >= 10 },
  { slug: 'social', name: 'Social Butterfly', description: 'Joined 10+ activities', icon: '🦋', earned: (m) => m.joined >= 10 },
  { slug: 'regular', name: 'Regular', description: 'Checked in 5+ times', icon: '📍', earned: (m) => m.checkins >= 5 },
  { slug: 'popular', name: 'Popular', description: '50+ followers', icon: '⭐', earned: (m) => m.followers >= 50 },
  { slug: 'trusted', name: 'Trusted', description: 'Trust score 50+', icon: '🛡️', earned: (m) => m.trust >= 50 },
];

export const badgeService = {
  catalog() {
    return BADGES.map(({ slug, name, description, icon }) => ({ slug, name, description, icon }));
  },

  async earned(userId: string) {
    const [hosted, joined, checkins, followers, trust] = await Promise.all([
      prisma.activity.count({ where: { hostId: userId, deletedAt: null } }),
      prisma.activityParticipant.count({ where: { userId, role: 'ATTENDEE', status: { in: ['JOINED', 'ATTENDED'] } } }),
      prisma.activityCheckin.count({ where: { userId } }),
      prisma.follow.count({ where: { followingId: userId, status: 'ACCEPTED' } }),
      prisma.trustScore.findUnique({ where: { userId }, select: { score: true } }).then((t) => t?.score ?? 0),
    ]);
    const metrics = { hosted, joined, checkins, followers, trust };
    return BADGES.filter((b) => b.earned(metrics)).map(({ slug, name, description, icon }) => ({
      slug,
      name,
      description,
      icon,
    }));
  },
};
