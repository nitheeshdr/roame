import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Activity, CheckCircle2, PauseCircle, ScrollText, ShieldX, UserCog, Users } from 'lucide-react';
import { userService } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

const STATS = [
  { key: 'total', label: 'Total users', icon: Users, tone: 'text-foreground' },
  { key: 'active', label: 'Active', icon: CheckCircle2, tone: 'text-success' },
  { key: 'suspended', label: 'Suspended', icon: PauseCircle, tone: 'text-warning' },
  { key: 'banned', label: 'Banned', icon: ShieldX, tone: 'text-destructive' },
  { key: 'admins', label: 'Admins', icon: UserCog, tone: 'text-primary' },
  { key: 'activities', label: 'Activities', icon: Activity, tone: 'text-accent' },
] as const;

export default async function OverviewPage() {
  const stats = await userService.stats();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Welcome back</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          A snapshot of the Roame community right now.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {STATS.map(({ key, label, icon: Icon, tone }) => (
          <Card key={key} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                <Icon className={`h-5 w-5 ${tone}`} />
              </span>
              <div>
                <p className="text-h3 font-semibold tabular-nums">{stats[key]}</p>
                <p className="text-caption text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-caption font-medium transition-colors hover:bg-secondary"
          >
            <Users className="h-4 w-4" /> Manage users
          </Link>
          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-caption font-medium transition-colors hover:bg-secondary"
          >
            <ScrollText className="h-4 w-4" /> View audit log ({stats.audits})
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
