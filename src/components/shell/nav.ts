import {
  LayoutDashboard,
  Users,
  ScrollText,
  CalendarRange,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Built this milestone vs. placeholder for a future module. */
  enabled: boolean;
}

/** The admin dashboard lives under /admin within the single Next.js app. */
export const ADMIN_ROOT = '/admin';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, enabled: true },
  { label: 'Users', href: '/admin/users', icon: Users, enabled: true },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText, enabled: true },
  { label: 'Activities', href: '/admin/activities', icon: CalendarRange, enabled: false },
  { label: 'Moderation', href: '/admin/moderation', icon: ShieldAlert, enabled: false },
];
