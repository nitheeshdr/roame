'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@/components/ui';
import type { ApiError } from '@/lib/validation';
import { CalendarRange, MoreHorizontal, Trash2 } from 'lucide-react';

type BadgeVariant = React.ComponentProps<typeof Badge>['variant'];

export interface AdminActivityRow {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED';
  visibility: string;
  startsAt: string | Date;
  city: string | null;
  host: { profile: { displayName: string } | null } | null;
  category: { name: string; icon: string | null } | null;
  _count: { participants: number; savedBy: number };
}

const STATUS_VARIANT: Record<AdminActivityRow['status'], BadgeVariant> = {
  PUBLISHED: 'success',
  DRAFT: 'neutral',
  CANCELLED: 'destructive',
  COMPLETED: 'primary',
  ARCHIVED: 'outline',
};

function formatDate(v: string | Date): string {
  return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ActivitiesTable({ rows }: { rows: AdminActivityRow[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function remove(id: string) {
    if (!confirm('Remove this activity? This cannot be undone by the host.')) return;
    setPending(true);
    try {
      const res = await fetch(`/api/admin/activities/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(body?.error.message ?? 'Failed to remove activity.');
      }
      toast.success('Activity removed.');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPending(false);
    }
  }

  if (rows.length === 0) {
    return <EmptyState icon={CalendarRange} title="No activities" description="Nothing matches your filters yet." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <p className="font-medium text-foreground">{a.title}</p>
                <p className="text-label text-muted-foreground">
                  {a.category?.name ?? 'Uncategorized'}
                  {a.city ? ` · ${a.city}` : ''} · {a.visibility}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {a.host?.profile?.displayName ?? '—'}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(a.startsAt)}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{a._count.participants}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Activity actions" disabled={pending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem destructive onClick={() => remove(a.id)}>
                      <Trash2 className="h-4 w-4" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
