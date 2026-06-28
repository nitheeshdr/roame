# Database

Postgres (Supabase-managed in production, local PostGIS in dev) via **Prisma**.
Schema: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Domains (~64 tables)

| Domain                 | Representative tables                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Auth & Users           | users, accounts, sessions, phone_otps, profiles, user_settings, devices, trust_scores, trust_score_events, interests, user_interests |
| Social                 | follows, blocks, feed_items                                                           |
| Activities & Discovery | categories, tags, activities, activity_tags, activity_participants, activity_invitations, activity_waitlist, activity_checkins, saved_activities, activity_media, search_history, recommendations |
| Communication          | conversations, conversation_participants, messages, message_reactions, message_reads, message_attachments |
| Notifications          | notifications, notification_preferences                                              |
| Safety & Moderation    | reports, moderation_queue, moderation_actions, content_flags, kyc_verifications       |
| Venues & Business      | businesses, venues, venue_media, venue_hours, bookings                                |
| Reviews                | reviews, review_responses                                                            |
| Payments               | payments, transactions, refunds, payment_methods, subscription_plans, subscriptions, invoices |
| Analytics              | analytics_events, activity_metrics, user_metrics                                     |
| Content                | announcements, faqs, content_pages, support_tickets, support_messages                |
| System                 | app_config, feature_flags, audit_logs                                                |

## Conventions

- **IDs**: `cuid()`. **Timestamps**: `createdAt`, `updatedAt`.
- **Soft delete**: nullable `deletedAt`; queries filter `deletedAt: null`.
- **Enums** for every status/role/type field.
- **Indexes** on all foreign keys and hot query paths; composite indexes such as
  `activity_participants (activityId, status)` and `audit_logs (entityType, entityId)`.
- **Audit**: the `audit_logs` table is written through `auditService` on every
  administrative mutation.

## PostGIS

Prisma cannot model spatial types, so location columns are declared
`Unsupported("geography(Point, 4326)")` on `profiles`, `activities`,
`activity_checkins`, and `venues`. They are read/written via raw SQL using the
builders in [`src/lib/utils/geo.ts`](../src/lib/utils/geo.ts):

```ts
const { sql, params } = nearbyPredicate('a.location', center, 5000);
await prisma.$queryRawUnsafe(`SELECT id FROM activities a WHERE ${sql}`, ...params);
```

GiST indexes for these columns are created by
[`prisma/rls/00_postgis.sql`](../prisma/rls/00_postgis.sql).

## Row Level Security

Policies live in
[`prisma/rls/01_policies.sql`](../prisma/rls/01_policies.sql)
and are applied with `pnpm db:rls` after migrations.

**Important:** the Next.js server uses Prisma with the privileged connection,
which **bypasses RLS** — all server-side authorization is enforced in the
service layer. RLS is defense-in-depth for any *direct* Supabase client access
(e.g. mobile Realtime), keyed off `auth.uid()` via `current_app_user()`.

## Commands

```bash
pnpm db:generate     # prisma generate
pnpm db:migrate      # prisma migrate dev
pnpm db:rls          # apply PostGIS indexes + RLS policies
pnpm db:seed         # reference data + admin + demo users
pnpm db:studio       # browse data
pnpm db:reset        # drop, re-migrate (destructive)
```

All DB scripts load the monorepo-root `.env` via `dotenv-cli`.
