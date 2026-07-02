import {
  LayoutDashboard,
  Users,
  ScrollText,
  CalendarRange,
  ShieldAlert,
  Terminal,
  Building2,
  LifeBuoy,
  Megaphone,
  HelpCircle,
  BarChart3,
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
  { label: 'Activities', href: '/admin/activities', icon: CalendarRange, enabled: true },
  { label: 'Moderation', href: '/admin/moderation', icon: ShieldAlert, enabled: true },
  { label: 'Venues', href: '/admin/venues', icon: Building2, enabled: true },
  { label: 'Support', href: '/admin/support', icon: LifeBuoy, enabled: true },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone, enabled: true },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle, enabled: true },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, enabled: true },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText, enabled: true },
  { label: 'API Endpoints', href: '/admin/endpoints', icon: Terminal, enabled: true },
];
