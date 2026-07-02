'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Building2, CheckCircle2, MoreHorizontal, Trash2, XCircle } from 'lucide-react';

type BadgeVariant = React.ComponentProps<typeof Badge>['variant'];

export interface AdminVenueRow {
  id: string;
  name: string;
  city: string | null;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CLOSED';
  createdAt: string | Date;
  owner: { profile: { displayName: string } | null } | null;
}

const STATUS_VARIANT: Record<AdminVenueRow['status'], BadgeVariant> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  REJECTED: 'destructive',
  CLOSED: 'outline',
};

export function VenuesTable({ rows }: { rows: AdminVenueRow[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function mutate(url: string, method: string, body: unknown, success: string) {
    setPending(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(b?.error.message ?? 'Action failed.');
      }
      toast.success(success);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPending(false);
    }
  }

  if (rows.length === 0) {
    return <EmptyState icon={Building2} title="No venues" description="No venues have been submitted yet." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venue</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <p className="font-medium text-foreground">{v.name}</p>
                <p className="text-label text-muted-foreground">{v.city ?? '—'}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">{v.owner?.profile?.displayName ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[v.status]}>{v.status}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Venue actions" disabled={pending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => mutate(`/api/venues/${v.id}`, 'PATCH', { status: 'ACTIVE' }, 'Venue approved.')}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => mutate(`/api/venues/${v.id}`, 'PATCH', { status: 'REJECTED' }, 'Venue rejected.')}
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      destructive
                      onClick={() => mutate(`/api/venues/${v.id}`, 'DELETE', null, 'Venue deleted.')}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
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
