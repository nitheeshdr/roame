import * as React from 'react';
import { paginationQuerySchema } from '@/lib/validation';
import { reportService } from '@/lib/services/report-service';
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
import { ShieldCheck } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { ResolveReport } from './report-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Moderation · Roame Admin' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type BadgeVariant = React.ComponentProps<typeof Badge>['variant'];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  OPEN: 'warning',
  UNDER_REVIEW: 'primary',
  RESOLVED: 'success',
  DISMISSED: 'outline',
};

export default async function ModerationPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const { page, pageSize } = paginationQuerySchema.parse({ page: raw.page });
  const result = await reportService.adminList(
    typeof raw.status === 'string' ? raw.status : undefined,
    page,
    pageSize,
  );
  const rows = result.data as Array<{
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    description: string | null;
    status: string;
    createdAt: string | Date;
    reporter: { profile: { displayName: string } | null } | null;
    reportedUser: { profile: { displayName: string } | null } | null;
  }>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Moderation</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          Review reports and apply actions. Every decision is written to the audit log.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Queue is clear" description="No reports to review right now." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{r.targetType}</p>
                    <p className="text-label text-muted-foreground">{r.targetId}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-foreground">{r.reason}</p>
                    {r.description ? (
                      <p className="line-clamp-1 text-label text-muted-foreground">{r.description}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.reporter?.profile?.displayName ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <ResolveReport reportId={r.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} total={result.total} />
    </div>
  );
}
