/** Row shape returned by userService.list — shared by the client components. */
export interface AdminUserRow {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPERADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED';
  createdAt: string | Date;
  lastLoginAt: string | Date | null;
  deletedAt: string | Date | null;
  profile: {
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
    city: string | null;
  } | null;
  trustScore: { score: number; level: number } | null;
}
