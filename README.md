# Roame

**Roame** is a hyperlocal social networking platform for discovering, creating, joining, and
managing real‑world activities — from morning runs and rooftop jam sessions to study groups and
pickup football. This repository is a **single, production‑grade Next.js 15 application** that
serves the public website, the admin/moderation dashboard, and the entire backend REST API from
one deployable. It runs end‑to‑end locally **with no third‑party credentials** and deploys to
**Vercel** with zero extra configuration.

---

## Table of contents

- [Highlights](#highlights)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Authentication](#authentication)
- [API reference](#api-reference)
- [Swagger / OpenAPI](#swagger--openapi)
- [Design system](#design-system)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deploying to Vercel](#deploying-to-vercel)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)

---

## Highlights

- **One Next.js app** — public site at `/`, admin dashboard at `/admin`, REST API at `/api`.
  The mobile client (Expo/React Native, future) talks to the same `/api`.
- **~120 REST endpoints** across 22 domains, layered with Clean Architecture
  (route → service → Prisma), validated with Zod, errors returned as typed values.
- **64‑table PostgreSQL schema** (Prisma) with **PostGIS** for geo‑queries, soft deletes,
  audit logging, enums, indexes, and **Row Level Security** policies.
- **Auth** — Phone OTP, Google/Apple OAuth, and admin email/password — behind a provider
  adapter with a **mock** mode, so everything runs without credentials. Cookie sessions for web,
  bearer tokens for mobile.
- **Swagger UI** at `/api/docs` backed by an auto‑generated OpenAPI 3.0 spec.
- **Premium design system** (shadcn/Radix + design tokens) with full light/dark mode.
- **Deferred integrations wired as adapters** — Ola Maps, Razorpay, OpenAI/Gemini, Supabase
  Storage — return a clean `501 Not configured` until their keys are added.

---

## Tech stack

| Layer        | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| App & UI     | Next.js 15 (App Router), React 18, TypeScript (strict), Tailwind CSS       |
| Components   | shadcn/ui patterns on Radix UI, Lucide icons, next-themes, Sonner toasts   |
| Backend      | Next.js Route Handlers at `/api` (Clean Architecture, Zod validation)      |
| Database     | PostgreSQL + PostGIS, Prisma ORM                                           |
| Auth         | Phone OTP · Google/Apple OAuth · admin email/password (mock + Supabase)    |
| Forms        | React Hook Form + Zod resolver                                             |
| Validation   | Zod (shared between API and forms)                                         |
| Maps         | Ola Maps (adapter — deferred)                                              |
| Payments     | Razorpay (adapter — deferred)                                              |
| AI           | OpenAI / Gemini (adapter — heuristic fallback for recommendations)         |
| Storage      | Supabase Storage (adapter — deferred)                                      |
| Tests        | Vitest                                                                     |
| Deploy       | Vercel                                                                     |

---

## Architecture

Roame follows **Clean Architecture / SOLID** principles. Every mutation flows through clear layers:

```
Route Handler (src/app/api/**)        ← thin: parse + Zod-validate + map errors → HTTP
  → Service (src/lib/services/**)      ← business logic, returns Result<T, AppError>
    → Prisma (src/lib/db)              ← data access
    → Adapter (src/lib/integrations)   ← third-party providers behind interfaces
  → Audit (audit-service)              ← records who did what (admin mutations)
```

Key ideas:

- **Errors as values.** Services return `Result<T, AppError>`; a shared `apiHandler` wrapper maps
  `AppError` subclasses to stable JSON responses and never leaks internals on 500s.
- **Validate once.** Zod schemas in `src/lib/validation` are reused by API validation and by
  client forms.
- **Dependency inversion.** Auth/Maps/Payments/AI/Storage sit behind interfaces; the concrete
  implementation is chosen by env (`AUTH_PROVIDER`, presence of keys), so the app builds and runs
  without any external service.
- **Defense in depth.** The server uses Prisma with a privileged connection (authorization
  enforced in services); **RLS** protects any direct database access (e.g. mobile Realtime).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full picture.

---

## Project structure

```
src/
  app/
    page.tsx                     Public landing page
    admin/
      (auth)/login/              Admin login (role-gated)
      (dashboard)/               Overview, Users, Audit Logs
    api/                         ~120 REST endpoints (see API reference)
      docs/                      Swagger UI (HTML)
      openapi.json/              OpenAPI 3.0 spec
  components/
    ui/                          Design system (Button, Card, Table, Dialog, Sheet, …)
    shell/                       Admin sidebar + topbar
    pagination.tsx
  lib/
    db.ts                        Prisma client singleton
    db-geo.ts                    PostGIS read/write helpers
    env.ts                       Validated environment (fails fast)
    auth/                        Providers (mock/supabase), session, guards
    services/                    Domain business logic (one service per area)
    integrations/                maps · payments · ai · storage adapters
    validation/                  Zod schemas + inferred types
    utils/                       Result/AppError, geo, pagination, crypto, password
    tokens/                      Design tokens (feed the Tailwind theme)
    badges.ts                    Derived badge catalog
    openapi.ts                   OpenAPI spec builder
  middleware.ts                  Gates /admin
prisma/
  schema.prisma                  64 tables across all domains
  seed.ts                        Reference data + admin + demo users
  rls/                           PostGIS indexes + RLS policies (SQL)
scripts/
  setup-db.sh                    One-command local DB bootstrap
  apply-sql.ts                   Applies prisma/rls/*.sql
docs/                            Architecture, Database, Auth, Contributing
```

The `@/*` path alias maps to `src/*`.

---

## Quickstart

**Requirements:** Node 20+, pnpm 9+, Docker (for local PostGIS).

```bash
# 1. Install dependencies (also runs `prisma generate`)
pnpm install

# 2. Create your local env
cp .env.example .env

# 3. Start a local PostGIS database
docker run --name roame-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=roame \
  -p 5432:5432 -d postgis/postgis:16-3.4

# 4. Migrate, apply PostGIS indexes + RLS, and seed
pnpm db:migrate
pnpm db:rls
pnpm db:seed
#   (or run all of the above + Docker in one go: pnpm db:setup)

# 5. Run the app
pnpm dev
```

Then open:

| URL                                   | What                                         |
| ------------------------------------- | -------------------------------------------- |
| http://localhost:3000                 | Public marketing site                        |
| http://localhost:3000/admin           | Admin dashboard                              |
| http://localhost:3000/api/docs        | Swagger UI (full API)                        |

**Admin login:** `admin@admin.com` / `admin123` (created by the seed).

**Mock OTP code:** `000000` (also printed to the server console on `POST /api/auth/otp/request`).

---

## Environment variables

Copy `.env.example` → `.env`. With `AUTH_PROVIDER=mock` and a local Postgres, **no third‑party
keys are required**. Deferred integrations only need keys when you want to enable them.

| Variable                          | Required        | Description                                                        |
| --------------------------------- | --------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`                    | ✅              | Postgres connection string (PostGIS enabled).                      |
| `DIRECT_URL`                      | ✅              | Non‑pooled connection for Prisma Migrate (same as above locally).  |
| `AUTH_PROVIDER`                   | ✅              | `mock` (default, no creds) or `supabase`.                          |
| `AUTH_SESSION_SECRET`             | ✅              | Secret used to sign session cookies/tokens (≥16 chars).            |
| `MOCK_OTP_CODE`                   | –               | Fixed OTP in mock mode (default `000000`).                         |
| `NEXT_PUBLIC_SUPABASE_URL`        | supabase/storage| Supabase project URL.                                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | supabase        | Supabase anon key.                                                 |
| `SUPABASE_SERVICE_ROLE_KEY`       | supabase/storage| Supabase service role key.                                        |
| `OLA_MAPS_API_KEY`                | maps            | Enables `/api/maps/*`.                                             |
| `RAZORPAY_KEY_ID` / `_SECRET`     | payments        | Enables `/api/payments/*` and `/api/refunds`.                      |
| `OPENAI_API_KEY` / `GEMINI_API_KEY` | ai            | Enables AI summarize/moderate; recommendations work without keys.  |
| `NEXT_PUBLIC_WEB_URL` / `_ADMIN_URL` | –            | Public URLs used in links.                                         |

---

## Database

- **64 tables** across Auth/Users, Social, Activities, Discovery, Chat, Notifications,
  Safety/Moderation, Venues/Business, Reviews, Payments/Subscriptions, Analytics, Content, and
  System config. See [docs/DATABASE.md](docs/DATABASE.md) for the full domain map.
- **Conventions:** `cuid()` ids, `createdAt`/`updatedAt`, nullable `deletedAt` (soft delete),
  enums for status/role/type, indexes on FKs and hot paths, a central `audit_logs` table.
- **PostGIS:** location columns (`profiles.homeLocation`, `activities.location`,
  `activity_checkins.location`, `venues.location`) are `geography(Point,4326)`, written/read via
  raw SQL helpers in [`src/lib/db-geo.ts`](src/lib/db-geo.ts) and indexed with GiST.
- **RLS:** policies in [`prisma/rls/`](prisma/rls) are applied with `pnpm db:rls`.

Browse data with `pnpm db:studio`.

---

## Authentication

Three entry points, one session model (details in [docs/AUTH.md](docs/AUTH.md)):

- **Phone OTP** — `POST /api/auth/otp/request` then `POST /api/auth/otp/verify`
  (rate‑limited, hashed OTP, 10‑min expiry). Verify returns `{ user, token }`.
- **OAuth** — `POST /api/auth/google` or `POST /api/auth/oauth` (Google/Apple).
- **Admin** — `POST /api/auth/admin-login` (email/password, role‑gated to ADMIN/SUPERADMIN).

Sessions are a **signed cookie** for the web and a **bearer token** for mobile/API clients
(`Authorization: Bearer <token>`). In mock mode the OTP is `MOCK_OTP_CODE` and OAuth returns a
deterministic identity, so the whole flow works without any provider.

---

## API reference

Base URL: `/api`. Auth column: 🔓 public · 👤 user · 🛡️ moderator · 🔑 admin. The full, always‑current
contract lives in **Swagger** (`/api/docs`).

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/google` | 🔓 | Sign in with Google |
| POST | `/auth/oauth` | 🔓 | Sign in with Google/Apple |
| POST | `/auth/otp/request` | 🔓 | Request a phone OTP |
| POST | `/auth/otp/verify` | 🔓 | Verify OTP → `{ user, token }` |
| POST | `/auth/admin-login` | 🔓 | Admin email/password login |
| POST | `/auth/logout` | 🔓 | Log out |
| GET | `/auth/me` | 👤 | Current session principal |

### Users & Profile
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | 👤 | My full profile |
| PATCH | `/users/me` | 👤 | Update profile |
| PATCH | `/users/avatar` | 👤 | Set avatar URL |
| PATCH | `/users/interests` | 👤 | Replace interests |
| PATCH | `/users/settings` | 👤 | Update settings |
| PATCH | `/users/location` | 👤 | Update home location (PostGIS) |
| GET | `/users/me/badges` | 👤 | My earned badges |
| GET | `/users/{id}` | 🔓 | Public profile |
| GET | `/users/{id}/activities` | 🔓 | Their public activities |
| GET | `/users/{id}/reviews` | 🔓 | Reviews received |

### Discovery
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/discovery/feed` | 👤 | Personalized feed |
| GET | `/discovery/nearby` | 🔓 | Nearby activities (PostGIS `ST_DWithin`) |
| GET | `/discovery/trending` | 🔓 | Trending |
| GET | `/discovery/recommended` | 🔓 | Recommended (heuristic/AI) |
| GET | `/discovery/categories` | 🔓 | Category catalog |
| GET | `/discovery/search` | 🔓 | Search activities |
| GET | `/discovery/cities` | 🔓 | Cities with counts |

### Activities & Participants
| Method | Path | Auth | Description |
|---|---|---|---|
| GET / POST | `/activities` | 🔓 / 👤 | List / create |
| GET / PATCH / DELETE | `/activities/{id}` | 🔓 / 👤 | Detail / update / delete (host) |
| GET | `/activities/my` · `/hosted` · `/joined` | 👤 | My activity lists |
| POST | `/activities/{id}/join` | 👤 | Join (auto‑waitlist if full) |
| DELETE | `/activities/{id}/leave` | 👤 | Leave (auto‑promotes next) |
| GET | `/activities/{id}/participants` | 🔓 | Participant list |
| POST | `/activities/{id}/checkin` | 👤 | Check in (geo‑validated) |
| POST / DELETE | `/activities/{id}/waitlist` | 👤 | Join / leave waitlist |

### Chat
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/chats` | 👤 | My conversations |
| GET | `/chats/{activityId}` | 👤 | Activity chat |
| GET / POST | `/chats/{activityId}/messages` | 👤 | List / send messages |
| PATCH / DELETE | `/chats/messages/{id}` | 👤 | Edit / delete message |
| POST | `/chats/messages/{id}/react` | 👤 | React |
| POST | `/chats/messages/{id}/read` | 👤 | Mark read |

### Social, Saved, Notifications
| Method | Path | Auth | Description |
|---|---|---|---|
| POST / DELETE | `/follow/{userId}` | 👤 | Follow / unfollow |
| GET | `/followers` · `/following` | 👤 | Social graph |
| POST / DELETE | `/block/{userId}` | 👤 | Block / unblock |
| GET | `/blocked` | 👤 | Blocked users |
| GET | `/saved` | 👤 | Saved activities |
| POST / DELETE | `/saved/{activityId}` | 👤 | Save / unsave |
| GET | `/notifications` | 👤 | List |
| PATCH | `/notifications/{id}/read` · `/read-all` | 👤 | Mark read |
| DELETE | `/notifications/{id}` | 👤 | Delete |

### Reviews & Safety
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/reviews` | 👤 | Create review |
| GET | `/reviews/{id}` | 🔓 | Reviews for a user |
| PATCH / DELETE | `/reviews/{id}` | 👤 | Update / delete |
| POST | `/reports` | 👤 | File a report |
| GET | `/reports/my` | 👤 | My reports |

### Venues, Bookings, Premium
| Method | Path | Auth | Description |
|---|---|---|---|
| GET / POST | `/venues` | 🔓 / 👤 | List / create |
| GET / PATCH / DELETE | `/venues/{id}` | 🔓 / 👤 | Detail / update / delete |
| GET / POST | `/bookings` | 👤 | My bookings / create |
| DELETE | `/bookings/{id}` | 👤 | Cancel |
| GET | `/subscriptions/plans` | 🔓 | Plans |
| POST | `/subscriptions/subscribe` | 👤 | Subscribe |
| GET | `/subscriptions/current` | 👤 | My subscription |
| DELETE | `/subscriptions/cancel` | 👤 | Cancel |

### Deferred integrations (return `501` until configured)
| Method | Path | Provider |
|---|---|---|
| GET | `/maps/search` · `/reverse` · `/autocomplete` · `/directions` · `/nearby` | Ola Maps |
| POST | `/payments/create-order` · `/verify` · `/refunds` | Razorpay |
| GET | `/payments/history` | (live) |
| POST | `/ai/recommendations` | heuristic (no key needed) |
| POST | `/ai/summarize` · `/ai/moderate` | OpenAI/Gemini |
| POST | `/upload/image` · `/upload/avatar`, DELETE `/upload/{id}` | Supabase Storage |

### Content, Analytics, Badges
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/faqs` | 🔓 | Published FAQs |
| POST | `/support` | 👤 | Open a support ticket |
| POST | `/analytics/event` | 🔓 | Track an event |
| GET | `/badges` | 🔓 | Badge catalog |

### Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` · `/admin/users/{id}` | 🔑 | List / detail |
| DELETE | `/admin/users/{id}` | 🔑 | Soft delete |
| PATCH | `/admin/users/{id}/role` · `/status` | 🔑 | Change role / status |
| GET | `/admin/audit-logs` | 🔑 | Audit log |
| GET | `/admin/reports` | 🛡️ | Moderation queue |
| PATCH | `/admin/reports/{id}` | 🛡️ | Resolve report (+ actions) |
| GET | `/admin/activities`, DELETE `/admin/activities/{id}` | 🛡️ | Moderate activities |
| GET / POST | `/admin/announcements` | 🔑 | CMS announcements |
| PATCH / DELETE | `/admin/announcements/{id}` | 🔑 | Edit / delete |
| POST | `/admin/faqs`, PATCH/DELETE `/admin/faqs/{id}` | 🔑 | CMS FAQs |
| GET | `/admin/support`, PATCH `/admin/support/{id}` | 🔑 | Support tickets |
| GET | `/admin/analytics` | 🔑 | Analytics summary |

---

## Swagger / OpenAPI

- **Swagger UI:** http://localhost:3000/api/docs — interactive, with `Authorize` for bearer tokens.
- **OpenAPI 3.0 spec:** http://localhost:3000/api/openapi.json — generated by
  [`src/lib/openapi.ts`](src/lib/openapi.ts) from a single endpoint table, so it never drifts.

To call an authenticated endpoint from Swagger: hit `POST /api/auth/otp/verify` with any seeded
phone (e.g. `+919000000001`) and code `000000`, copy the returned `token`, click **Authorize**,
and paste it.

---

## Design system

A handcrafted, premium UI (no AI‑slop templates). Tokens live in
[`src/lib/tokens`](src/lib/tokens) and feed the Tailwind theme + CSS variables:

- **Palette:** white / off‑white / charcoal neutrals with **emerald** (primary) and **blue**
  (accent). Orange = warnings, red = destructive, green = success. **No purple, no neon gradients.**
- **System:** 8px spacing, 16–24px radii, soft shadows, Inter type scale, Lucide icons.
- **States:** every component supports light/dark, disabled, loading, and error states; WCAG AA.
- Components in [`src/components/ui`](src/components/ui): Button, Card, Input, Label, Badge,
  Avatar, Table, Dialog, Sheet, Dropdown, Skeleton, EmptyState, Toast, ThemeToggle.

---

## Scripts

```bash
pnpm dev            # Run the app (http://localhost:3000)
pnpm build          # prisma generate && next build
pnpm start          # Start the production build
pnpm type-check     # tsc --noEmit
pnpm lint           # next lint
pnpm test           # Vitest (utils + validation)

pnpm db:setup       # Docker Postgres + migrate + rls + seed (one command)
pnpm db:generate    # prisma generate
pnpm db:migrate     # prisma migrate dev
pnpm db:migrate:deploy
pnpm db:rls         # apply PostGIS indexes + RLS policies
pnpm db:seed        # reference data + admin + demo users
pnpm db:studio      # Prisma Studio
pnpm db:reset       # drop + re-migrate (destructive)
```

---

## Testing

Vitest covers the framework‑agnostic core (Result/error mapping, geo math, pagination, password
hashing, rate limiting, and Zod schemas):

```bash
pnpm test
```

> The HTTP route handlers are type‑checked and build‑verified. For full confidence in the
> database flows (PostGIS writes, transactions), run them against a local Postgres (`pnpm db:setup`)
> and exercise the endpoints via Swagger.

---

## Deploying to Vercel

1. Push to GitHub and **import the repo in Vercel** — it auto‑detects Next.js.
2. Provision a Postgres database with **PostGIS** (Supabase, Neon, etc.).
3. Set environment variables in the Vercel dashboard — at minimum `DATABASE_URL`, `DIRECT_URL`,
   `AUTH_SESSION_SECRET`, and `AUTH_PROVIDER`. Add provider keys to enable Maps/Payments/AI/Storage.
4. The `build` script runs `prisma generate && next build`; `postinstall` also runs
   `prisma generate`, so the client is always in sync.
5. Run migrations + RLS against production once:
   ```bash
   DATABASE_URL=<prod> pnpm db:migrate:deploy
   DATABASE_URL=<prod> pnpm db:rls
   DATABASE_URL=<prod> pnpm db:seed   # optional: reference data + admin
   ```

`pnpm.onlyBuiltDependencies` is already configured so Vercel's pnpm runs Prisma's build scripts.

---

## Roadmap

The schema and types for **every** domain already exist; these milestones add deeper logic + UI:

- **M2** — Activities polish: invitations, paid activities via Razorpay, richer waitlist rules.
- **M3** — Realtime chat & notifications (Supabase Realtime + Expo push), social feed ranking.
- **M4** — Venues/bookings with payments, reviews moderation, subscription billing.
- **M5** — KYC, AI recommendations & moderation (wire OpenAI/Gemini), Ola Maps, mobile app (Expo).

---

## Troubleshooting

- **`Invalid environment configuration`** — copy `.env.example` to `.env`; `DATABASE_URL` and
  `AUTH_SESSION_SECRET` are required.
- **Prisma can't reach the database** — ensure the Docker Postgres container is running and
  `DATABASE_URL` matches its port (`5432`).
- **PostGIS / `ST_DWithin` errors** — run `pnpm db:rls` (creates the extension and GiST indexes).
- **501 from Maps/Payments/AI/Upload** — expected until you add the relevant provider keys.
- **Prisma client out of date after schema edits** — run `pnpm db:generate`.

---

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — monorepo‑free architecture & adapters
- [docs/DATABASE.md](docs/DATABASE.md) — schema, PostGIS, RLS, conventions
- [docs/AUTH.md](docs/AUTH.md) — auth flows & mock mode
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — workflow & how to add a feature
