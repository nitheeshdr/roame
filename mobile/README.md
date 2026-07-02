# Roame Mobile (Expo + NativeWind)

Expo Router app for Roame. Runs in **Expo Go** (stable Expo SDK 52 + NativeWind v4).
Consumes the same **real** Roame API as the web — no mock data. Sign-in is **real Google**
(expo-auth-session → `/api/auth/google`). Premium UI, emerald/blue tokens, line icons —
no emoji, no gradients.

> gluestack-ui v5 (preview NativeWind v5 + New Architecture) generally needs a **custom dev
> build**, not Expo Go. This app uses the stable NativeWind v4 stack so it runs in Expo Go
> today; gluestack can be layered later behind a dev build.

## Run

```bash
cd mobile
npm install
cp .env.example .env     # set EXPO_PUBLIC_API_URL to your Mac's LAN IP:3000
npx expo start           # scan the QR with Expo Go (phone on the same Wi-Fi)
```

Make sure the Roame web/API is running (`pnpm dev` in the repo root) and reachable at the
`EXPO_PUBLIC_API_URL` you set.

## Environment

- `EXPO_PUBLIC_API_URL` — Roame API base, e.g. `http://192.168.1.20:3000` (LAN IP, not localhost).
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth Web client id to enable "Continue with Google".

## Structure

```
app/
  _layout.tsx     Stack + gesture root, imports global.css
  index.tsx       Welcome (Explore + Continue with Google)
  discover.tsx    Activity list from GET /api/activities (real data)
components/ui.tsx  Button, Card, Badge (self-contained, premium)
lib/api.ts         Fetch wrapper + SecureStore bearer token
lib/auth.ts        Real Google Sign-In (expo-auth-session)
tailwind.config.js Emerald primary, blue accent, neutral ramp
```
