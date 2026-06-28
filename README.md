# Roame

Hyperlocal social networking platform for discovering, creating, joining, and managing
real-world activities.

This is a **single Next.js 15 app** (App Router) — one deployable that serves the public
site, the admin dashboard, and the backend API. It runs locally with **no third-party
credentials** and deploys to **Vercel** with zero extra config.

## What's here (Milestone 1)

- Public marketing site at `/`
- **Admin dashboard** at `/admin` (login, users management, audit logs) — role-gated
- Backend API at `/api` (Phone OTP, Google/Apple OAuth, admin auth, users, audit)
- Full **Prisma schema** — 64 tables across all product domains, PostGIS + RLS
- A reusable **design system** (shadcn/Radix + design tokens), light/dark

## Stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| App      | Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui       |
| Backend  | Next.js Route Handlers at `/api` (Clean Architecture)            |
| Database | Postgres + PostGIS, Prisma ORM                                   |
| Auth     | Phone OTP, Google/Apple, admin email/password (mock + Supabase)  |
| Maps/Pay/AI | Ola Maps / Razorpay / OpenAI·Gemini — behind adapters (deferred) |

## Project layout

```
src/
  app/
    page.tsx           public landing
    admin/             dashboard: (auth)/login, (dashboard)/{overview,users,audit-logs}
    api/               auth, users, audit-logs route handlers
  components/
    ui/                design system (Button, Card, Table, Dialog, Sheet, …)
    shell/             admin sidebar + topbar
  lib/
    db.ts              Prisma client singleton
    env.ts             validated environment
    auth/              providers (mock/supabase), session, guards
    services/          auth / user / audit business logic
    utils/             Result/AppError, geo (PostGIS), pagination, crypto, password
    validation/        Zod schemas + inferred types
    tokens/            design tokens
  middleware.ts        gates /admin
prisma/
  schema.prisma        64 tables
  seed.ts              reference data + admin + demo users
  rls/                 PostGIS indexes + RLS policies
scripts/               db setup helpers
docs/                  architecture, database, auth
```

## Quickstart

Requirements: **Node 20+**, **pnpm**, **Docker** (for local PostGIS).

```bash
# 1. Install
pnpm install

# 2. Configure env
cp .env.example .env

# 3. Start a local PostGIS database
docker run --name roame-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=roame \
  -p 5432:5432 -d postgis/postgis:16-3.4

# 4. Migrate, apply PostGIS + RLS, seed   (or: pnpm db:setup)
pnpm db:migrate
pnpm db:rls
pnpm db:seed

# 5. Run
pnpm dev
# → http://localhost:3000          public site
# → http://localhost:3000/admin    admin dashboard
#   login: admin@admin.com / admin123
```

Inspect data with `pnpm db:studio`.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel (it auto-detects Next.js).
2. Add a Postgres database with PostGIS (e.g. Supabase, Neon) and set env vars in the
   Vercel dashboard — at minimum `DATABASE_URL`, `AUTH_SESSION_SECRET`, and
   `AUTH_PROVIDER` (`mock` or `supabase`). See [.env.example](.env.example).
3. The `build` script runs `prisma generate && next build`; `postinstall` also runs
   `prisma generate`, so the client is always in sync.
4. Run `pnpm db:migrate:deploy` and `pnpm db:rls` against the production database once
   (e.g. from CI or locally with the prod `DATABASE_URL`).

## Commands

```bash
pnpm dev / build / start   # Next.js
pnpm type-check            # tsc --noEmit
pnpm lint                  # next lint
pnpm test                  # Vitest (utils + validation)
pnpm db:migrate / db:rls / db:seed / db:studio
```

## API & Swagger

The full REST API (~120 endpoints across auth, users, discovery, activities,
participants, chat, social, reviews, safety, venues, bookings, payments,
subscriptions, AI, analytics, and admin) is served under `/api`.

- **Swagger UI:** http://localhost:3000/api/docs
- **OpenAPI spec:** http://localhost:3000/api/openapi.json

Auth uses the session cookie (web) or `Authorization: Bearer <token>` (mobile/API).
Get a token from `POST /api/auth/otp/verify` (mock OTP is `000000`). Endpoints tagged
**Maps / Payments / AI / Media** return `501 Not configured` until their provider
credentials are set in `.env` — the adapters are wired and ready.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DATABASE.md](docs/DATABASE.md)
- [docs/AUTH.md](docs/AUTH.md)
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
