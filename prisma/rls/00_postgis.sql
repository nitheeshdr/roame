-- ─────────────────────────────────────────────────────────────────────────────
-- PostGIS extension + spatial (GiST) indexes for the geography columns Prisma
-- manages as Unsupported("geography(Point, 4326)"). Run AFTER `prisma migrate`.
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE INDEX IF NOT EXISTS profiles_home_location_gix
  ON profiles USING GIST ("homeLocation");

CREATE INDEX IF NOT EXISTS activities_location_gix
  ON activities USING GIST ("location");

CREATE INDEX IF NOT EXISTS activity_checkins_location_gix
  ON activity_checkins USING GIST ("location");

CREATE INDEX IF NOT EXISTS venues_location_gix
  ON venues USING GIST ("location");
