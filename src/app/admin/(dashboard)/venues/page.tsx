import * as React from 'react';
import { listVenuesQuerySchema } from '@/lib/validation';
import { venueService } from '@/lib/services/commerce-service';
import { Pagination } from '@/components/pagination';
import { VenuesTable, type AdminVenueRow } from './venues-table';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Venues · Roame Admin' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminVenuesPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const query = listVenuesQuerySchema.parse({
    page: raw.page,
    q: typeof raw.q === 'string' ? raw.q : undefined,
    city: typeof raw.city === 'string' ? raw.city : undefined,
  });
  const result = await venueService.adminList(query);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Venues</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          Approve submitted venues, reject spam, or remove closed listings.
        </p>
      </div>

      <VenuesTable rows={result.data as unknown as AdminVenueRow[]} />
      <Pagination page={result.page} totalPages={result.totalPages} total={result.total} />
    </div>
  );
}
