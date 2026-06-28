#!/usr/bin/env bash
# Local database bootstrap: starts PostGIS in Docker, then generates the Prisma
# client, runs migrations, applies PostGIS indexes + RLS, and seeds.
set -euo pipefail

CONTAINER=roame-db

if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "▶ Starting PostGIS container '${CONTAINER}'…"
  docker run --name "${CONTAINER}" -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=roame -p 5432:5432 -d postgis/postgis:16-3.4
  echo "▶ Waiting for Postgres to accept connections…"
  sleep 5
else
  echo "▶ Starting existing container '${CONTAINER}'…"
  docker start "${CONTAINER}" >/dev/null
  sleep 3
fi

echo "▶ prisma generate"; pnpm db:generate
echo "▶ prisma migrate";  pnpm db:migrate
echo "▶ apply RLS + PostGIS"; pnpm db:rls
echo "▶ seed"; pnpm db:seed
echo "✔ Database ready."
