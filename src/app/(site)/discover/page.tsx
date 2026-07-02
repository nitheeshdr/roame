import * as React from 'react';
import { listActivitiesQuerySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { contentService } from '@/lib/services/content-service';
import { EmptyState } from '@/components/ui';
import { CalendarSearch } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { ActivityCard, type ActivityCardData } from '@/components/site/activity-card';
import { DiscoverControls, type CategoryOption } from './discover-controls';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discover · Roame' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DiscoverPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const query = listActivitiesQuerySchema.parse({
    page: raw.page,
    q: typeof raw.q === 'string' ? raw.q : undefined,
    categoryId: typeof raw.categoryId === 'string' && raw.categoryId ? raw.categoryId : undefined,
    city: typeof raw.city === 'string' ? raw.city : undefined,
  });

  const [categories, result] = await Promise.all([
    contentService.categories(),
    activityService.list(query),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-h1 font-bold tracking-tight">Discover</h1>
        <p className="mt-2 text-body text-muted-foreground">
          Activities happening around you. Join one, or host your own.
        </p>
      </div>

      <DiscoverControls categories={categories as unknown as CategoryOption[]} />

      <div className="mt-8">
        {result.data.length === 0 ? (
          <EmptyState
            icon={CalendarSearch}
            title="Nothing here yet"
            description="Try a different category or search, or be the first to host something."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(result.data as unknown as ActivityCardData[]).map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Pagination page={result.page} totalPages={result.totalPages} total={result.total} />
      </div>
    </main>
  );
}
