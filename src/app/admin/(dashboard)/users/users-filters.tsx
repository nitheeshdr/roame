'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui';
import { Search } from 'lucide-react';

const ROLES = ['', 'USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN'];
const STATUSES = ['', 'PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED'];

const selectClass =
  'h-10 rounded-md border border-input bg-background px-3 text-caption text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function UsersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = React.useState(params.get('search') ?? '');

  /** Push a single param change, resetting to page 1. */
  const setParam = React.useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  // Debounce the free-text search.
  React.useEffect(() => {
    const current = params.get('search') ?? '';
    if (search === current) return;
    const t = setTimeout(() => setParam('search', search.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="pl-9"
          aria-label="Search users"
        />
      </div>

      <select
        className={selectClass}
        value={params.get('role') ?? ''}
        onChange={(e) => setParam('role', e.target.value)}
        aria-label="Filter by role"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r || 'All roles'}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={params.get('status') ?? ''}
        onChange={(e) => setParam('status', e.target.value)}
        aria-label="Filter by status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s || 'All statuses'}
          </option>
        ))}
      </select>
    </div>
  );
}
