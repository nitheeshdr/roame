'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const ACTIONS = [
  '',
  'CREATE',
  'UPDATE',
  'DELETE',
  'SOFT_DELETE',
  'RESTORE',
  'LOGIN',
  'LOGOUT',
  'ROLE_CHANGE',
  'STATUS_CHANGE',
];

const selectClass =
  'h-10 rounded-md border border-input bg-background px-3 text-caption text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function AuditFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        className={selectClass}
        value={params.get('action') ?? ''}
        onChange={(e) => setParam('action', e.target.value)}
        aria-label="Filter by action"
      >
        {ACTIONS.map((a) => (
          <option key={a} value={a}>
            {a || 'All actions'}
          </option>
        ))}
      </select>
    </div>
  );
}
