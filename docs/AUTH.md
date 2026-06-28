# Authentication

Three entry points, one session model. All logic lives in
[`src/lib/services/auth-service.ts`](../src/lib/services/auth-service.ts)
behind the `AuthProvider` interface.

## Providers

`AUTH_PROVIDER` selects the implementation
([`lib/auth/providers.ts`](../src/lib/auth/providers.ts)):

- **`mock`** (default) — deterministic. OTP is the fixed `MOCK_OTP_CODE`
  (default `000000`, also logged to the server console); OAuth returns a stable
  identity. Runs with **no credentials**.
- **`supabase`** — delegates to Supabase Auth (requires the Supabase env keys).
  Wiring points are stubbed for a later milestone.

## Flows

### Phone OTP

1. `POST /api/auth/otp/request` `{ phone }` — rate-limited (5 / 10 min / phone),
   stores a **hashed** OTP (`sha256(phone:code)`) with a 10-minute expiry.
2. `POST /api/auth/otp/verify` `{ phone, code }` — checks expiry/attempts,
   constant-time compares the hash, upserts the user + profile, and sets the
   session cookie.

### OAuth (Google / Apple)

`POST /api/auth/oauth` `{ provider, credential }` → resolves an identity, links
or creates `accounts` + `users`, sets the session cookie.

### Admin email/password

`POST /api/auth/admin-login` `{ email, password }` → verifies the PBKDF2 hash,
requires role ∈ {ADMIN, SUPERADMIN} and status ACTIVE, sets the session cookie.
Uniform "invalid email or password" avoids account enumeration.

## Sessions

Stateless **signed cookie** (`roame_admin_session`): `base64url(payload).HMAC`.
The pure encode/verify lives in
[`lib/auth/session-token.ts`](../src/lib/auth/session-token.ts) (Edge-safe,
used by middleware); the cookie + guard helpers are in
[`lib/auth/session.ts`](../src/lib/auth/session.ts) (`getSession`,
`requireAdmin`).

## Authorization

- **Middleware** ([`src/middleware.ts`](../src/middleware.ts)) gates
  `/admin/*` and redirects unauthenticated users to `/admin/login`.
- **API routes** call `requireAdmin()` themselves — the real boundary.
- **`updateRole`** additionally requires SUPERADMIN to grant admin roles.

## Try it locally

```
AUTH_PROVIDER=mock pnpm dev
# http://localhost:3000/admin/login → admin@admin.com / admin123
```
