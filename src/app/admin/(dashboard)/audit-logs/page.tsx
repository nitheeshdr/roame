import * as React from 'react';
import { auditLogQuerySchema } from '@/lib/validation';
import {
  Badge,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { ScrollText } from 'lucide-react';
import { auditService } from '@/lib/services/audit-service';
import { Pagination } from '@/components/pagination';
import { AuditFilters } from './audit-filters';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Audit Logs · Roame Admin' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type BadgeVariant = React.ComponentProps<typeof Badge>['variant'];

const ACTION_VARIANT: Record<string, BadgeVariant> = {
  CREATE: 'success',
  RESTORE: 'success',
  LOGIN: 'primary',
  LOGOUT: 'neutral',
  UPDATE: 'neutral',
  ROLE_CHANGE: 'warning',
  STATUS_CHANGE: 'warning',
  DELETE: 'destructive',
  SOFT_DELETE: 'destructive',
};

function formatDateTime(value: Date): string {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AuditLogsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const query = auditLogQuerySchema.parse({
    page: raw.page,
    action: typeof raw.action === 'string' && raw.action ? raw.action : undefined,
    entityType: typeof raw.entityType === 'string' ? raw.entityType : undefined,
  });

  const { rows, total } = await auditService.list(query);
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Audit Logs</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          Every administrative mutation, newest first.
        </p>
      </div>

      <AuditFilters />

      {rows.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries"
          description="Administrative actions will appear here as they happen."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ACTION_VARIANT[log.action] ?? 'neutral'}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{log.entityType}</span>
                    {log.entityId ? (
                      <span className="ml-1 text-label text-muted-foreground">{log.entityId}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.actor?.profile?.displayName ?? log.actor?.email ?? 'System'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={query.page} totalPages={totalPages} total={total} />
    </div>
  );
}
