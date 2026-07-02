import * as SecureStore from 'expo-secure-store';

/** Base URL of the Roame Next.js API. Set EXPO_PUBLIC_API_URL for devices. */
const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'roame_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Typed fetch wrapper — attaches the bearer token and unwraps API errors. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body as { error?: { message?: string } } | null)?.error?.message;
    throw new Error(message ?? 'Request failed');
  }
  return body as T;
}

// ── Domain types (subset used by the app) ──────────────────────────────────
export interface ActivityCard {
  id: string;
  title: string;
  startsAt: string;
  city: string | null;
  category: { name: string; slug: string } | null;
  host: { profile: { displayName: string } | null } | null;
  _count: { participants: number };
}

export interface Page<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

export const roame = {
  listActivities: (params: Record<string, string> = {}) =>
    api<Page<ActivityCard>>(`/api/activities?${new URLSearchParams(params)}`),
  categories: () => api<{ data: { id: string; slug: string; name: string }[] }>('/api/discovery/categories'),
  me: () => api<{ user: unknown }>('/api/auth/me'),
  join: (id: string) => api(`/api/activities/${id}/join`, { method: 'POST' }),
};
