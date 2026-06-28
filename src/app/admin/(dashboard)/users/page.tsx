import * as React from 'react';
import { userListQuerySchema } from '@/lib/validation';
import { userService } from '@/lib/services/user-service';
import { Pagination } from '@/components/pagination';
import { UsersFilters } from './users-filters';
import { UsersTable } from './users-table';
import type { AdminUserRow } from './types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users · Roame Admin' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  // Tolerant parse: bad params fall back to defaults rather than erroring the page.
  const query = userListQuerySchema.parse({
    page: raw.page,
    pageSize: raw.pageSize,
    search: typeof raw.search === 'string' ? raw.search : undefined,
    role: typeof raw.role === 'string' && raw.role ? raw.role : undefined,
    status: typeof raw.status === 'string' && raw.status ? raw.status : undefined,
  });

  const result = await userService.list(query);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Users</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          Search members, change roles and status, or remove accounts.
        </p>
      </div>

      <UsersFilters />
      <UsersTable rows={result.data as unknown as AdminUserRow[]} />
      <Pagination page={result.page} totalPages={result.totalPages} total={result.total} />
    </div>
  );
}
