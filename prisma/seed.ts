/**
 * Idempotent seed: reference data (interests, categories, plans, FAQs, flags,
 * app config) + a SUPERADMIN and a couple of demo users so the admin dashboard
 * has something to show on first run.
 *
 *   pnpm db:seed
 */
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { hashPassword } from '../src/lib/utils';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

const INTERESTS = [
  ['running', 'Running', '🏃'],
  ['football', 'Football', '⚽'],
  ['coffee', 'Coffee Meetups', '☕'],
  ['music', 'Live Music', '🎵'],
  ['hiking', 'Hiking', '🥾'],
  ['board-games', 'Board Games', '🎲'],
  ['photography', 'Photography', '📷'],
  ['startups', 'Startups', '🚀'],
  ['yoga', 'Yoga', '🧘'],
  ['cycling', 'Cycling', '🚴'],
] as const;

const CATEGORIES = [
  ['sports', 'Sports & Fitness', '🏅', '#10B981'],
  ['social', 'Social & Hangouts', '🎉', '#3B82F6'],
  ['outdoors', 'Outdoors & Adventure', '🏞️', '#059669'],
  ['arts', 'Arts & Culture', '🎨', '#2563EB'],
  ['food', 'Food & Drink', '🍽️', '#F97316'],
  ['learning', 'Learning & Workshops', '📚', '#52525B'],
  ['gaming', 'Gaming & Esports', '🎮', '#3B82F6'],
  ['wellness', 'Health & Wellness', '🌿', '#16A34A'],
] as const;

const PLANS = [
  ['free', 'Free', 'Get started with Roame', 0, 'MONTHLY'],
  ['plus-monthly', 'Roame Plus', 'Priority discovery + advanced filters', 19900, 'MONTHLY'],
  ['plus-yearly', 'Roame Plus (Yearly)', 'Two months free', 199000, 'YEARLY'],
] as const;

const FAQS = [
  ['How do I create an activity?', 'Tap the + button, fill in the details, and publish.', 'activities'],
  ['Is Roame free?', 'Yes. Roame Plus unlocks extra discovery features.', 'billing'],
  ['How does check-in work?', 'Check in at the venue when you arrive to confirm attendance.', 'activities'],
] as const;

const FLAGS = [
  ['ai_recommendations', 'AI-powered recommendations', false],
  ['venue_bookings', 'Venue booking flow', false],
  ['live_location', 'Live location sharing in activity chat', false],
] as const;

async function main() {
  console.log('Seeding Roame…');

  // ── Interests ──────────────────────────────────────────────────────────────
  for (const [slug, name, icon] of INTERESTS) {
    await prisma.interest.upsert({
      where: { slug },
      update: { name, icon },
      create: { slug, name, icon },
    });
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  for (const [index, [slug, name, icon, color]] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, icon, color, sortOrder: index },
      create: { slug, name, icon, color, sortOrder: index },
    });
  }

  // ── Subscription plans ─────────────────────────────────────────────────────
  for (const [slug, name, description, priceCents, interval] of PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { slug },
      update: { name, description, priceCents },
      create: {
        slug,
        name,
        description,
        priceCents,
        interval: interval as 'MONTHLY' | 'YEARLY',
      },
    });
  }

  // ── FAQs ───────────────────────────────────────────────────────────────────
  for (const [index, [question, answer, category]] of FAQS.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question } });
    if (existing) {
      await prisma.faq.update({ where: { id: existing.id }, data: { answer, category } });
    } else {
      await prisma.faq.create({ data: { question, answer, category, sortOrder: index } });
    }
  }

  // ── Feature flags ──────────────────────────────────────────────────────────
  for (const [key, description, isEnabled] of FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key },
      update: { description },
      create: { key, description, isEnabled },
    });
  }

  // ── App config ─────────────────────────────────────────────────────────────
  await prisma.appConfig.upsert({
    where: { key: 'discovery.defaultRadiusKm' },
    update: { value: 10 },
    create: { key: 'discovery.defaultRadiusKm', value: 10 },
  });

  // ── Admin user ─────────────────────────────────────────────────────────────
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: UserRole.SUPERADMIN, status: UserStatus.ACTIVE, passwordHash },
    create: {
      email: ADMIN_EMAIL,
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      passwordHash,
      profile: { create: { displayName: 'Roame Admin', username: 'roame_admin' } },
      settings: { create: {} },
      trustScore: { create: { score: 100, level: 5 } },
    },
  });

  // ── Demo users (so the Users table isn't empty) ────────────────────────────
  const demoUsers = [
    { phone: '+919000000001', displayName: 'Aarav Sharma', username: 'aarav' },
    { phone: '+919000000002', displayName: 'Diya Patel', username: 'diya' },
    { phone: '+919000000003', displayName: 'Kabir Nair', username: 'kabir' },
  ];
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: {
        phone: u.phone,
        status: UserStatus.ACTIVE,
        phoneVerifiedAt: new Date(),
        profile: { create: { displayName: u.displayName, username: u.username, city: 'Bengaluru' } },
        settings: { create: {} },
        trustScore: { create: { score: 20, level: 2 } },
      },
    });
  }

  // ── A seed audit entry ─────────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'CREATE',
      entityType: 'Seed',
      entityId: 'initial',
      after: { note: 'Initial database seed completed.' },
    },
  });

  console.log('✔ Seed complete.');
  console.log(`  Admin login → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('✖ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
