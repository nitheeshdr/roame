-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security policies.
--
-- Architecture note: the Next.js backend talks to Postgres through Prisma using
-- the privileged connection (table owner / service role), which BYPASSES RLS —
-- all authorization for server logic is enforced in the service layer. These
-- policies are the defense-in-depth layer that protects any DIRECT access via
-- the Supabase client (e.g. mobile Realtime subscriptions) using the
-- `auth.uid()` of the Supabase-authenticated user.
--
-- `current_app_user()` resolves the acting user id from the JWT claim that
-- Supabase sets (`request.jwt.claims`). On a plain local Postgres without
-- Supabase, these policies are inert because connections use the owner role.
-- Idempotent: drops+recreates each policy.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION current_app_user() RETURNS text AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true), '')::json ->> 'sub',
    NULL
  );
$$ LANGUAGE sql STABLE;

-- ── users ────────────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_self_select ON users;
CREATE POLICY users_self_select ON users
  FOR SELECT USING (id = current_app_user());
DROP POLICY IF EXISTS users_self_update ON users;
CREATE POLICY users_self_update ON users
  FOR UPDATE USING (id = current_app_user());

-- ── profiles (public read for non-private, owner write) ──────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_read ON profiles;
CREATE POLICY profiles_read ON profiles
  FOR SELECT USING ("isPrivate" = false OR "userId" = current_app_user());
DROP POLICY IF EXISTS profiles_write ON profiles;
CREATE POLICY profiles_write ON profiles
  FOR ALL USING ("userId" = current_app_user())
  WITH CHECK ("userId" = current_app_user());

-- ── activities (public visibility readable; host writes) ─────────────────────
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS activities_read ON activities;
CREATE POLICY activities_read ON activities
  FOR SELECT USING (
    ("visibility" = 'PUBLIC' AND "deletedAt" IS NULL)
    OR "hostId" = current_app_user()
  );
DROP POLICY IF EXISTS activities_write ON activities;
CREATE POLICY activities_write ON activities
  FOR ALL USING ("hostId" = current_app_user())
  WITH CHECK ("hostId" = current_app_user());

-- ── messages (only conversation participants) ────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS messages_participant_read ON messages;
CREATE POLICY messages_participant_read ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp."conversationId" = messages."conversationId"
        AND cp."userId" = current_app_user()
        AND cp."leftAt" IS NULL
    )
  );
DROP POLICY IF EXISTS messages_sender_insert ON messages;
CREATE POLICY messages_sender_insert ON messages
  FOR INSERT WITH CHECK ("senderId" = current_app_user());

-- ── notifications (owner only) ───────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_owner ON notifications;
CREATE POLICY notifications_owner ON notifications
  FOR ALL USING ("userId" = current_app_user())
  WITH CHECK ("userId" = current_app_user());
