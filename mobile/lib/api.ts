import * as SecureStore from 'expo-secure-store';

/** Base URL of the Roame Next.js API. */
export const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://roame-nine.vercel.app';
const TOKEN_KEY = 'roame_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string): Promise<void> {
  if (!token || typeof token !== 'string') {
    throw new Error('Sign in failed: no token returned by the server.');
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

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
    throw new Error((body as { error?: { message?: string } } | null)?.error?.message ?? 'Request failed');
  }
  return body as T;
}

const qs = (p: Record<string, string | number | undefined> = {}) =>
  '?' +
  new URLSearchParams(
    Object.fromEntries(Object.entries(p).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])),
  );

// ── Types ───────────────────────────────────────────────────────────────────
export interface ActivityCard {
  id: string;
  title: string;
  startsAt: string;
  city: string | null;
  category: { name: string; slug: string } | null;
  host: { profile: { displayName: string; avatarUrl: string | null } | null } | null;
  _count: { participants: number };
}
export interface Page<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}
export interface MapPoint {
  id: string;
  title: string;
  city: string | null;
  lat: number;
  lng: number;
  participants: number;
}
export interface SessionUser {
  id: string;
  role: string;
  status: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
}
export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

// ── API surface ──────────────────────────────────────────────────────────────
export const roame = {
  // auth
  emailLogin: (email: string, password: string) =>
    api<{ token: string; user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (email: string, password: string, displayName: string) =>
    api<{ token: string; user: SessionUser }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),
  forgotPassword: (email: string) =>
    api<{ ok: true; resetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    api<{ ok: true }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  google: (credential: string) =>
    api<{ token: string; user: SessionUser }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
  me: () => api<{ user: SessionUser }>('/api/auth/me'),

  // discovery / activities
  listActivities: (p: { page?: number; pageSize?: number; q?: string; categoryId?: string } = {}) =>
    api<Page<ActivityCard>>(`/api/activities${qs(p)}`),
  activity: (id: string) => api<ActivityCard & Record<string, unknown>>(`/api/activities/${id}`),
  createActivity: (body: unknown) =>
    api<{ id: string }>('/api/activities', { method: 'POST', body: JSON.stringify(body) }),
  join: (id: string) => api(`/api/activities/${id}/join`, { method: 'POST' }),
  leave: (id: string) => api(`/api/activities/${id}/leave`, { method: 'DELETE' }),
  mine: (kind: 'my' | 'hosted' | 'joined') => api<Page<ActivityCard>>(`/api/activities/${kind}`),
  categories: () => api<{ data: { id: string; slug: string; name: string }[] }>('/api/discovery/categories'),
  mapPoints: () => api<{ data: MapPoint[] }>('/api/discovery/map'),
  trending: () => api<{ data: ActivityCard[] }>('/api/discovery/trending'),

  // saved
  saved: () => api<Page<ActivityCard>>('/api/saved'),
  save: (id: string) => api(`/api/saved/${id}`, { method: 'POST' }),
  unsave: (id: string) => api(`/api/saved/${id}`, { method: 'DELETE' }),

  // notifications
  notifications: () => api<Page<Notification> & { unread: number }>('/api/notifications'),
  readAll: () => api('/api/notifications/read-all', { method: 'PATCH' }),

  // chat
  messages: (activityId: string) =>
    api<Page<{ id: string; body: string | null; senderId: string; createdAt: string; sender: { profile: { displayName: string } | null } }>>(
      `/api/chats/${activityId}/messages`,
    ),
  sendMessage: (activityId: string, body: string) =>
    api(`/api/chats/${activityId}/messages`, { method: 'POST', body: JSON.stringify({ body }) }),
};
