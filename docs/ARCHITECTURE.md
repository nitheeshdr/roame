# Architecture

Roame is a **single Next.js 15 app**. Next.js is both the frontend and the backend;
Supabase (or any Postgres+PostGIS) provides the database; all third-party integrations
sit behind adapter interfaces so the app builds and runs locally with no credentials.
One deployable → trivial to host on Vercel.

## Structure

```
src/
  app/
    /          public marketing/discovery site
    /admin     admin & moderation dashboard (role-gated)
    /api       Route Handlers — the backend
  components/  ui/ (design system) + shell/ (admin chrome)
  lib/
    db.ts       Prisma client singleton
    env.ts      validated environment (fails fast)
    auth/       providers (mock/supabase), session, requireAdmin
    services/   business logic (auth/user/audit)
    utils/      Result/AppError, geo (PostGIS), pagination, crypto, password
    validation/ Zod schemas + inferred types (validation source of truth)
    tokens/     design tokens (feed the Tailwind theme)
  middleware.ts gates /admin
prisma/         schema (64 tables), seed, rls/*.sql
```

The `@/*` path alias maps to `src/*`.

## Layered (Clean) Architecture

Request flow for any mutation:

```
Route Handler (app/api/**)        ← thin: parse + validate + map errors
  → Service (lib/services/**)     ← business logic, returns Result<T, AppError>
    → Prisma (lib/db)             ← data access
    → Adapter (lib/auth/providers)← third-party behind an interface
  → Audit (lib/services/audit)    ← records who did what
```

Principles:

- **SOLID / DIP** — services depend on the `AuthProvider` interface, not a vendor.
  `MockAuthProvider` (default) and `SupabaseAuthProvider` are swapped via `AUTH_PROVIDER`.
- **Errors as values** — services return `Result<T, AppError>`; the `apiHandler` wrapper
  maps `AppError` subclasses to stable HTTP responses and never leaks internals on 500s.
- **Validate once** — Zod schemas in `lib/validation` are reused by API validation and by
  React Hook Form on the client.
- **Tokens once** — `lib/tokens` feeds the Tailwind theme and `app/globals.css` variables.

## Authorization

- Pages under `/admin` are gated by Edge **middleware** (cheap redirect) using a signed
  session cookie.
- API routes independently call `requireAdmin()` server-side — middleware is convenience,
  not the security boundary.
- The database has **RLS** policies as defense-in-depth for any direct Supabase client
  access (e.g. mobile Realtime in a later milestone).

## Adapters (deferred integrations)

| Concern  | Location                       | Milestone-1 behavior           |
| -------- | ------------------------------ | ------------------------------ |
| Auth     | `lib/auth/providers.ts`        | Mock (deterministic, no creds) |
| Maps     | `lib/utils/geo.ts` (Ola Maps)  | PostGIS query builders ready   |
| Payments | (Razorpay)                     | Tables/types only              |
| AI recs  | (OpenAI/Gemini)                | Tables/types only              |

## A note on mobile

The original spec included an Expo (React Native) client. React Native cannot live inside
a Next.js project, so it is intentionally **not** part of this single-app build. When
added, it lives in its own project/repo and consumes this app's `/api` and the same
validation contracts (which can be extracted to a shared package at that point).
