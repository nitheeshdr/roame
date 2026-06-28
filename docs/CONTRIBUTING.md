# Contributing

## Prerequisites

- Node 20+, pnpm, Docker (for local PostGIS).

## Setup

```bash
pnpm install
cp .env.example .env
docker run --name roame-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=roame \
  -p 5432:5432 -d postgis/postgis:16-3.4
pnpm db:migrate && pnpm db:rls && pnpm db:seed
```

## Day-to-day

```bash
pnpm dev          # public site, /admin, and /api on http://localhost:3000
pnpm type-check
pnpm lint
pnpm test         # Vitest (utils + validation)
```

## Conventions

- **TypeScript strict** everywhere. No `any` without justification.
- **Validation** lives in `src/lib/validation` (Zod). Reuse schemas on both client and
  server — never hand-roll a parallel validator.
- **Services return `Result<T, AppError>`**; throw only for genuine bugs. Route Handlers
  stay thin and go through `apiHandler`.
- **Every admin mutation writes an audit log** via `auditService`.
- **New tables** follow the conventions in [DATABASE.md](./DATABASE.md) (cuid id,
  timestamps, `deletedAt`, indexes, enums). Add Zod schemas in `src/lib/validation`.
- **UI** uses the `src/components/ui` primitives and the design tokens — neutral palette
  with emerald/blue accents, 8px spacing, 16–24px radii. No purple, no neon gradients.

## Adding a feature module (M2+)

1. Schema + migration in `prisma/schema.prisma` (+ RLS in `prisma/rls/` if needed).
2. Zod schemas + types in `src/lib/validation`.
3. Service in `src/lib/services` (+ adapter in `src/lib/auth` or a new `src/lib/<x>` if
   third-party).
4. Route Handlers in `src/app/api/**`.
5. Admin UI under `src/app/admin`.
6. Tests (service happy/edge paths, schema validation).
