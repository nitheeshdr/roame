import * as React from 'react';
import { analyticsService } from '@/lib/services/analytics-service';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Activity, BarChart3, CalendarRange, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics · Roame Admin' };

export default async function AnalyticsPage() {
  const summary = await analyticsService.summary();

  const cards = [
    { label: 'Users', value: summary.totals.users, icon: Users, tone: 'text-primary' },
    { label: 'Activities', value: summary.totals.activities, icon: CalendarRange, tone: 'text-accent' },
    { label: 'Bookings', value: summary.totals.bookings, icon: Activity, tone: 'text-success' },
    { label: 'Events (7d)', value: summary.last7Days.events, icon: BarChart3, tone: 'text-foreground' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Analytics</h2>
        <p className="mt-1 text-caption text-muted-foreground">Platform totals and recent activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                <Icon className={`h-5 w-5 ${tone}`} />
              </span>
              <div>
                <p className="text-h3 font-semibold tabular-nums">{value}</p>
                <p className="text-caption text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top events (last 7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.last7Days.topEvents.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No events yet"
              description="Analytics events show up here as clients call POST /api/analytics/event."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.last7Days.topEvents.map((e) => (
                  <TableRow key={e.name}>
                    <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{e.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
