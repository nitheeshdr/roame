import * as React from 'react';
import { listActivitiesQuerySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { Pagination } from '@/components/pagination';
import { ActivitiesTable, type AdminActivityRow } from './activities-table';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Activities · Roame Admin' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminActivitiesPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const query = listActivitiesQuerySchema.parse({
    page: raw.page,
    q: typeof raw.q === 'string' ? raw.q : undefined,
    status: typeof raw.status === 'string' && raw.status ? raw.status : undefined,
  });
  const result = await activityService.adminList(query);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Activities</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          Every activity across the platform. Remove ones that break the rules.
        </p>
      </div>

      <ActivitiesTable rows={result.data as unknown as AdminActivityRow[]} />
      <Pagination page={result.page} totalPages={result.totalPages} total={result.total} />
    </div>
  );
}
