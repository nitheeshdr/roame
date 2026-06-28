'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  initials,
  toast,
} from '@/components/ui';
import type { ApiError } from '@/lib/validation';
import { MoreHorizontal, RotateCcw, Trash2, Users } from 'lucide-react';
import type { AdminUserRow } from './types';

type BadgeVariant = React.ComponentProps<typeof Badge>['variant'];

const STATUS_VARIANT: Record<AdminUserRow['status'], BadgeVariant> = {
  ACTIVE: 'success',
  PENDING: 'neutral',
  SUSPENDED: 'warning',
  BANNED: 'destructive',
  DEACTIVATED: 'outline',
};

const ROLES: AdminUserRow['role'][] = ['USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN'];
const STATUSES: AdminUserRow['status'][] = ['ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED'];

function formatDate(value: string | Date | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function UsersTable({ rows }: { rows: AdminUserRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<AdminUserRow | null>(null);
  const [pending, setPending] = React.useState(false);

  async function mutate(input: { url: string; method: string; body?: unknown; success: string }) {
    setPending(true);
    try {
      const res = await fetch(input.url, {
        method: input.method,
        headers: input.body ? { 'Content-Type': 'application/json' } : undefined,
        body: input.body ? JSON.stringify(input.body) : undefined,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(body?.error.message ?? 'Action failed.');
      }
      toast.success(input.success);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPending(false);
    }
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trust</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow
                key={u.id}
                className="cursor-pointer"
                onClick={() => setSelected(u)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {u.profile?.avatarUrl ? <AvatarImage src={u.profile.avatarUrl} alt="" /> : null}
                      <AvatarFallback>{initials(u.profile?.displayName ?? u.email)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {u.profile?.displayName ?? 'Unnamed'}
                      </p>
                      <p className="truncate text-label text-muted-foreground">
                        {u.email ?? u.phone ?? '—'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === 'USER' ? 'neutral' : 'primary'}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {u.trustScore ? `${u.trustScore.score} · L${u.trustScore.level}` : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActions user={u} pending={pending} mutate={mutate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          {selected ? <UserDetail user={selected} /> : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function RowActions({
  user,
  pending,
  mutate,
}: {
  user: AdminUserRow;
  pending: boolean;
  mutate: (i: { url: string; method: string; body?: unknown; success: string }) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="User actions" disabled={pending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Change role</DropdownMenuLabel>
        {ROLES.filter((r) => r !== user.role).map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() =>
              mutate({
                url: `/api/admin/users/${user.id}/role`,
                method: 'PATCH',
                body: { role },
                success: `Role updated to ${role}.`,
              })
            }
          >
            Set {role}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Change status</DropdownMenuLabel>
        {STATUSES.filter((s) => s !== user.status).map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() =>
              mutate({
                url: `/api/admin/users/${user.id}/status`,
                method: 'PATCH',
                body: { status },
                success: `Status set to ${status}.`,
              })
            }
          >
            Set {status}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        {user.deletedAt ? (
          <DropdownMenuItem
            onClick={() =>
              mutate({
                url: `/api/admin/users/${user.id}`,
                method: 'PATCH',
                body: { status: 'ACTIVE' },
                success: 'User restored.',
              })
            }
          >
            <RotateCcw className="h-4 w-4" /> Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            destructive
            onClick={() =>
              mutate({
                url: `/api/admin/users/${user.id}`,
                method: 'DELETE',
                success: 'User soft-deleted.',
              })
            }
          >
            <Trash2 className="h-4 w-4" /> Soft delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserDetail({ user }: { user: AdminUserRow }) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Display name', user.profile?.displayName ?? '—'],
    ['Username', user.profile?.username ? `@${user.profile.username}` : '—'],
    ['Email', user.email ?? '—'],
    ['Phone', user.phone ?? '—'],
    ['City', user.profile?.city ?? '—'],
    ['Role', <Badge key="r" variant="primary">{user.role}</Badge>],
    ['Status', <Badge key="s" variant={STATUS_VARIANT[user.status]}>{user.status}</Badge>],
    ['Trust', user.trustScore ? `${user.trustScore.score} (level ${user.trustScore.level})` : '—'],
    ['Last login', formatDate(user.lastLoginAt)],
    ['Joined', formatDate(user.createdAt)],
  ];

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {user.profile?.avatarUrl ? <AvatarImage src={user.profile.avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials(user.profile?.displayName ?? user.email)}</AvatarFallback>
          </Avatar>
          <div>
            <SheetTitle>{user.profile?.displayName ?? 'Unnamed user'}</SheetTitle>
            <SheetDescription>{user.id}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <dl className="mt-2 divide-y divide-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-caption text-muted-foreground">{label}</dt>
            <dd className="text-caption font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
