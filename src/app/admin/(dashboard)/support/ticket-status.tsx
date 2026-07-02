'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui';
import type { ApiError } from '@/lib/validation';

const STATUSES = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'];

export function TicketStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState(status);
  const [pending, setPending] = React.useState(false);

  async function onChange(next: string) {
    setValue(next);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(b?.error.message ?? 'Failed to update ticket.');
      }
      toast.success('Ticket updated.');
      router.refresh();
    } catch (err) {
      setValue(status);
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <select
      className="h-9 rounded-md border border-input bg-background px-2 text-caption text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      value={value}
      disabled={pending}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Ticket status"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
