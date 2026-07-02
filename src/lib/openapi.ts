/**
 * OpenAPI 3.0 spec for the Roame API, built from a compact endpoint table so it
 * stays complete without thousands of lines. Served at /api/openapi.json and
 * rendered by Swagger UI at /api/docs.
 */

export type Method = 'get' | 'post' | 'patch' | 'delete';

export interface Ep {
  method: Method;
  path: string; // OpenAPI path with {param}
  tag: string;
  summary: string;
  auth?: 'user' | 'admin' | 'mod'; // omitted = public
  body?: boolean;
}

export const ENDPOINTS: Ep[] = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  { method: 'post', path: '/auth/google', tag: 'Auth', summary: 'Sign in with Google', body: true },
  { method: 'post', path: '/auth/oauth', tag: 'Auth', summary: 'Sign in with Google/Apple', body: true },
  { method: 'post', path: '/auth/otp/request', tag: 'Auth', summary: 'Request a phone OTP', body: true },
  { method: 'post', path: '/auth/otp/verify', tag: 'Auth', summary: 'Verify a phone OTP, returns token', body: true },
  { method: 'post', path: '/auth/admin-login', tag: 'Auth', summary: 'Admin email/password login', body: true },
  { method: 'post', path: '/auth/login', tag: 'Auth', summary: 'Email/password login (returns token)', body: true },
  { method: 'post', path: '/auth/signup', tag: 'Auth', summary: 'Email/password signup (returns token)', body: true },
  { method: 'post', path: '/auth/forgot-password', tag: 'Auth', summary: 'Request a password reset', body: true },
  { method: 'post', path: '/auth/reset-password', tag: 'Auth', summary: 'Reset password with a token', body: true },
  { method: 'post', path: '/auth/logout', tag: 'Auth', summary: 'Log out' },
  { method: 'get', path: '/auth/me', tag: 'Auth', summary: 'Current session principal', auth: 'user' },

  // ── Usalso ers & Profile ─────────────────────────────────────────────────────────
  { method: 'get', path: '/users/me', tag: 'Users', summary: 'My full profile', auth: 'user' },
  { method: 'patch', path: '/users/me', tag: 'Users', summary: 'Update my profile', auth: 'user', body: true },
  { method: 'patch', path: '/users/avatar', tag: 'Users', summary: 'Set avatar URL', auth: 'user', body: true },
  { method: 'patch', path: '/users/interests', tag: 'Users', summary: 'Replace interests', auth: 'user', body: true },
  { method: 'patch', path: '/users/settings', tag: 'Users', summary: 'Update settings', auth: 'user', body: true },
  { method: 'patch', path: '/users/location', tag: 'Users', summary: 'Update home location', auth: 'user', body: true },
  { method: 'get', path: '/users/me/badges', tag: 'Users', summary: 'My earned badges', auth: 'user' },
  { method: 'get', path: '/users/{id}', tag: 'Users', summary: 'Public profile' },
  { method: 'get', path: '/users/{id}/activities', tag: 'Users', summary: "A user's public activities" },
  { method: 'get', path: '/users/{id}/reviews', tag: 'Users', summary: "A user's reviews" },

  // ── Discovery ─────────────────────────────────────────────────────────────
  { method: 'get', path: '/discovery/feed', tag: 'Discovery', summary: 'Personalized feed', auth: 'user' },
  { method: 'get', path: '/discovery/nearby', tag: 'Discovery', summary: 'Nearby activities (PostGIS)' },
  { method: 'get', path: '/discovery/trending', tag: 'Discovery', summary: 'Trending activities' },
  { method: 'get', path: '/discovery/recommended', tag: 'Discovery', summary: 'Recommended activities' },
  { method: 'get', path: '/discovery/categories', tag: 'Discovery', summary: 'Category catalog' },
  { method: 'get', path: '/discovery/search', tag: 'Discovery', summary: 'Search activities' },
  { method: 'get', path: '/discovery/cities', tag: 'Discovery', summary: 'Cities with activity counts' },
  { method: 'get', path: '/discovery/map', tag: 'Discovery', summary: 'Activity map points (lat/lng)' },

  // ── Activities ────────────────────────────────────────────────────────────
  { method: 'get', path: '/activities', tag: 'Activities', summary: 'List activities' },
  { method: 'post', path: '/activities', tag: 'Activities', summary: 'Create an activity', auth: 'user', body: true },
  { method: 'get', path: '/activities/my', tag: 'Activities', summary: 'My activities', auth: 'user' },
  { method: 'get', path: '/activities/hosted', tag: 'Activities', summary: 'Activities I host', auth: 'user' },
  { method: 'get', path: '/activities/joined', tag: 'Activities', summary: 'Activities I joined', auth: 'user' },
  { method: 'get', path: '/activities/{id}', tag: 'Activities', summary: 'Activity detail' },
  { method: 'patch', path: '/activities/{id}', tag: 'Activities', summary: 'Update activity (host)', auth: 'user', body: true },
  { method: 'delete', path: '/activities/{id}', tag: 'Activities', summary: 'Delete activity (host)', auth: 'user' },
  { method: 'post', path: '/activities/{id}/join', tag: 'Participants', summary: 'Join (or waitlist)', auth: 'user' },
  { method: 'delete', path: '/activities/{id}/leave', tag: 'Participants', summary: 'Leave', auth: 'user' },
  { method: 'get', path: '/activities/{id}/participants', tag: 'Participants', summary: 'List participants' },
  { method: 'post', path: '/activities/{id}/checkin', tag: 'Participants', summary: 'Check in', auth: 'user', body: true },
  { method: 'post', path: '/activities/{id}/waitlist', tag: 'Participants', summary: 'Join waitlist', auth: 'user' },
  { method: 'delete', path: '/activities/{id}/waitlist', tag: 'Participants', summary: 'Leave waitlist', auth: 'user' },

  // ── Chat ──────────────────────────────────────────────────────────────────
  { method: 'get', path: '/chats', tag: 'Chat', summary: 'My conversations', auth: 'user' },
  { method: 'get', path: '/chats/{activityId}', tag: 'Chat', summary: "Activity chat", auth: 'user' },
  { method: 'get', path: '/chats/{activityId}/messages', tag: 'Chat', summary: 'List messages', auth: 'user' },
  { method: 'post', path: '/chats/{activityId}/messages', tag: 'Chat', summary: 'Send message', auth: 'user', body: true },
  { method: 'patch', path: '/chats/messages/{id}', tag: 'Chat', summary: 'Edit message', auth: 'user', body: true },
  { method: 'delete', path: '/chats/messages/{id}', tag: 'Chat', summary: 'Delete message', auth: 'user' },
  { method: 'post', path: '/chats/messages/{id}/react', tag: 'Chat', summary: 'React to message', auth: 'user', body: true },
  { method: 'post', path: '/chats/messages/{id}/read', tag: 'Chat', summary: 'Mark message read', auth: 'user' },

  // ── Saved ─────────────────────────────────────────────────────────────────
  { method: 'get', path: '/saved', tag: 'Saved', summary: 'My saved activities', auth: 'user' },
  { method: 'post', path: '/saved/{activityId}', tag: 'Saved', summary: 'Save an activity', auth: 'user' },
  { method: 'delete', path: '/saved/{activityId}', tag: 'Saved', summary: 'Unsave an activity', auth: 'user' },

  // ── Notifications ───────────────────────────────────────────────────────────
  { method: 'get', path: '/notifications', tag: 'Notifications', summary: 'List notifications', auth: 'user' },
  { method: 'patch', path: '/notifications/read-all', tag: 'Notifications', summary: 'Mark all read', auth: 'user' },
  { method: 'patch', path: '/notifications/{id}/read', tag: 'Notifications', summary: 'Mark one read', auth: 'user' },
  { method: 'delete', path: '/notifications/{id}', tag: 'Notifications', summary: 'Delete notification', auth: 'user' },

  // ── Social ──────────────────────────────────────────────────────────────────
  { method: 'post', path: '/follow/{userId}', tag: 'Social', summary: 'Follow a user', auth: 'user' },
  { method: 'delete', path: '/follow/{userId}', tag: 'Social', summary: 'Unfollow a user', auth: 'user' },
  { method: 'get', path: '/followers', tag: 'Social', summary: 'My followers', auth: 'user' },
  { method: 'get', path: '/following', tag: 'Social', summary: 'Who I follow', auth: 'user' },

  // ── Reviews ─────────────────────────────────────────────────────────────────
  { method: 'post', path: '/reviews', tag: 'Reviews', summary: 'Create a review', auth: 'user', body: true },
  { method: 'get', path: '/reviews/{id}', tag: 'Reviews', summary: "Reviews for a user (id = userId)" },
  { method: 'patch', path: '/reviews/{id}', tag: 'Reviews', summary: 'Update a review', auth: 'user', body: true },
  { method: 'delete', path: '/reviews/{id}', tag: 'Reviews', summary: 'Delete a review', auth: 'user' },

  // ── Safety ──────────────────────────────────────────────────────────────────
  { method: 'post', path: '/reports', tag: 'Safety', summary: 'File a report', auth: 'user', body: true },
  { method: 'get', path: '/reports/my', tag: 'Safety', summary: 'My reports', auth: 'user' },
  { method: 'post', path: '/block/{userId}', tag: 'Safety', summary: 'Block a user', auth: 'user' },
  { method: 'delete', path: '/block/{userId}', tag: 'Safety', summary: 'Unblock a user', auth: 'user' },
  { method: 'get', path: '/blocked', tag: 'Safety', summary: 'Users I blocked', auth: 'user' },

  // ── Badges ──────────────────────────────────────────────────────────────────
  { method: 'get', path: '/badges', tag: 'Badges', summary: 'Badge catalog' },

  // ── Media ─────────────────────────────────────────────────────────────────
  { method: 'post', path: '/upload/image', tag: 'Media', summary: 'Upload image (501 until storage configured)', auth: 'user' },
  { method: 'post', path: '/upload/avatar', tag: 'Media', summary: 'Upload avatar (501 until storage configured)', auth: 'user' },
  { method: 'delete', path: '/upload/{id}', tag: 'Media', summary: 'Delete media', auth: 'user' },

  // ── Maps (Ola — 501 until configured) ────────────────────────────────────────
  { method: 'get', path: '/maps/search', tag: 'Maps', summary: 'Place search' },
  { method: 'get', path: '/maps/reverse', tag: 'Maps', summary: 'Reverse geocode' },
  { method: 'get', path: '/maps/autocomplete', tag: 'Maps', summary: 'Autocomplete' },
  { method: 'get', path: '/maps/directions', tag: 'Maps', summary: 'Directions' },
  { method: 'get', path: '/maps/nearby', tag: 'Maps', summary: 'Nearby places' },

  // ── Venues ──────────────────────────────────────────────────────────────────
  { method: 'get', path: '/venues', tag: 'Venues', summary: 'List venues' },
  { method: 'post', path: '/venues', tag: 'Venues', summary: 'Create a venue', auth: 'user', body: true },
  { method: 'get', path: '/venues/{id}', tag: 'Venues', summary: 'Venue detail' },
  { method: 'patch', path: '/venues/{id}', tag: 'Venues', summary: 'Update venue', auth: 'user', body: true },
  { method: 'delete', path: '/venues/{id}', tag: 'Venues', summary: 'Delete venue', auth: 'user' },

  // ── Bookings ──────────────────────────────────────────────────────────────
  { method: 'post', path: '/bookings', tag: 'Bookings', summary: 'Create booking', auth: 'user', body: true },
  { method: 'get', path: '/bookings', tag: 'Bookings', summary: 'My bookings', auth: 'user' },
  { method: 'delete', path: '/bookings/{id}', tag: 'Bookings', summary: 'Cancel booking', auth: 'user' },

  // ── Payments (Razorpay — 501 until configured) ──────────────────────────────
  { method: 'post', path: '/payments/create-order', tag: 'Payments', summary: 'Create payment order', auth: 'user', body: true },
  { method: 'post', path: '/payments/verify', tag: 'Payments', summary: 'Verify payment', auth: 'user', body: true },
  { method: 'get', path: '/payments/history', tag: 'Payments', summary: 'Payment history', auth: 'user' },
  { method: 'post', path: '/refunds', tag: 'Payments', summary: 'Request refund', auth: 'user', body: true },

  // ── Premium ─────────────────────────────────────────────────────────────────
  { method: 'get', path: '/subscriptions/plans', tag: 'Premium', summary: 'Plans' },
  { method: 'post', path: '/subscriptions/subscribe', tag: 'Premium', summary: 'Subscribe', auth: 'user', body: true },
  { method: 'get', path: '/subscriptions/current', tag: 'Premium', summary: 'My subscription', auth: 'user' },
  { method: 'delete', path: '/subscriptions/cancel', tag: 'Premium', summary: 'Cancel subscription', auth: 'user' },

  // ── AI ──────────────────────────────────────────────────────────────────────
  { method: 'post', path: '/ai/recommendations', tag: 'AI', summary: 'Recommendations (heuristic/AI)', auth: 'user' },
  { method: 'post', path: '/ai/summarize', tag: 'AI', summary: 'Summarize (501 until configured)', auth: 'user', body: true },
  { method: 'post', path: '/ai/moderate', tag: 'AI', summary: 'Moderate (501 until configured)', auth: 'mod', body: true },

  // ── Content ───────────────────────────────────────────────────────────────
  { method: 'get', path: '/faqs', tag: 'Content', summary: 'Published FAQs' },
  { method: 'post', path: '/support', tag: 'Content', summary: 'Open a support ticket', auth: 'user', body: true },
  { method: 'post', path: '/analytics/event', tag: 'Content', summary: 'Track analytics event', body: true },

  // ── Admin ─────────────────────────────────────────────────────────────────
  { method: 'get', path: '/admin/users', tag: 'Admin', summary: 'List users', auth: 'admin' },
  { method: 'get', path: '/admin/users/{id}', tag: 'Admin', summary: 'User detail', auth: 'admin' },
  { method: 'delete', path: '/admin/users/{id}', tag: 'Admin', summary: 'Soft-delete user', auth: 'admin' },
  { method: 'patch', path: '/admin/users/{id}/role', tag: 'Admin', summary: 'Change role', auth: 'admin', body: true },
  { method: 'patch', path: '/admin/users/{id}/status', tag: 'Admin', summary: 'Change status', auth: 'admin', body: true },
  { method: 'get', path: '/admin/audit-logs', tag: 'Admin', summary: 'Audit log', auth: 'admin' },
  { method: 'get', path: '/admin/reports', tag: 'Admin', summary: 'Moderation queue', auth: 'mod' },
  { method: 'patch', path: '/admin/reports/{id}', tag: 'Admin', summary: 'Resolve a report', auth: 'mod', body: true },
  { method: 'get', path: '/admin/activities', tag: 'Admin', summary: 'List activities', auth: 'mod' },
  { method: 'delete', path: '/admin/activities/{id}', tag: 'Admin', summary: 'Remove activity', auth: 'mod' },
  { method: 'get', path: '/admin/announcements', tag: 'Admin', summary: 'List announcements', auth: 'admin' },
  { method: 'post', path: '/admin/announcements', tag: 'Admin', summary: 'Create announcement', auth: 'admin', body: true },
  { method: 'patch', path: '/admin/announcements/{id}', tag: 'Admin', summary: 'Update announcement', auth: 'admin', body: true },
  { method: 'delete', path: '/admin/announcements/{id}', tag: 'Admin', summary: 'Delete announcement', auth: 'admin' },
  { method: 'post', path: '/admin/faqs', tag: 'Admin', summary: 'Create FAQ', auth: 'admin', body: true },
  { method: 'patch', path: '/admin/faqs/{id}', tag: 'Admin', summary: 'Update FAQ', auth: 'admin', body: true },
  { method: 'delete', path: '/admin/faqs/{id}', tag: 'Admin', summary: 'Delete FAQ', auth: 'admin' },
  { method: 'get', path: '/admin/support', tag: 'Admin', summary: 'List support tickets', auth: 'admin' },
  { method: 'patch', path: '/admin/support/{id}', tag: 'Admin', summary: 'Update ticket status', auth: 'admin', body: true },
  { method: 'get', path: '/admin/analytics', tag: 'Admin', summary: 'Analytics summary', auth: 'admin' },
];

function pathParams(path: string) {
  return [...path.matchAll(/\{(\w+)\}/g)].map((m) => ({
    name: m[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }));
}

export function buildOpenApiSpec() {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const ep of ENDPOINTS) {
    const fullPath = `/api${ep.path}`;
    paths[fullPath] ??= {};
    const responses: Record<string, unknown> = {
      '200': { description: 'OK' },
      '400': { description: 'Validation error' },
    };
    if (ep.auth) responses['401'] = { description: 'Unauthorized' };
    const operation: Record<string, unknown> = {
      tags: [ep.tag],
      summary: ep.summary,
      responses,
      ...(ep.auth ? { security: [{ bearerAuth: [] }] } : {}),
      ...(ep.body
        ? { requestBody: { content: { 'application/json': { schema: { type: 'object' } } } } }
        : {}),
      ...(pathParams(ep.path).length ? { parameters: pathParams(ep.path) } : {}),
    };
    paths[fullPath][ep.method] = operation;
  }

  const tags = [...new Set(ENDPOINTS.map((e) => e.tag))].map((name) => ({ name }));

  return {
    openapi: '3.0.3',
    info: {
      title: 'Roame API',
      version: '0.1.0',
      description:
        'Hyperlocal social platform API. Auth via session cookie (web) or `Authorization: Bearer <token>` (mobile). ' +
        'Endpoints tagged Maps/Payments/AI/Media return 501 until their provider credentials are configured.',
    },
    servers: [{ url: '/', description: 'This deployment' }],
    tags,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', description: 'Token from /api/auth/otp/verify' },
      },
    },
    paths,
  };
}
