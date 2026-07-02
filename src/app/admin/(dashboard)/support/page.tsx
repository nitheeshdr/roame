import * as React from 'react';
import { contentService } from '@/lib/services/content-service';
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
import { LifeBuoy } from 'lucide-react';
import { TicketStatus } from './ticket-status';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Support · Roame Admin' };

type BadgeVariant = React.ComponentProps<typeof Badge>['variant'];
const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  LOW: 'neutral',
  MEDIUM: 'primary',
  HIGH: 'warning',
  URGENT: 'destructive',
};

function formatDate(v: string | Date): string {
  return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default async function SupportPage() {
  const tickets = (await contentService.adminTickets()) as Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string | Date;
    user: { profile: { displayName: string } | null } | null;
  }>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Support</h2>
        <p className="mt-1 text-caption text-muted-foreground">User support tickets and their status.</p>
      </div>

      {tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No tickets" description="No one needs help right now." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead className="w-40">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-foreground">{t.subject}</TableCell>
                  <TableCell className="text-muted-foreground">{t.user?.profile?.displayName ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_VARIANT[t.priority] ?? 'neutral'}>{t.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(t.createdAt)}</TableCell>
                  <TableCell>
                    <TicketStatus id={t.id} status={t.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
