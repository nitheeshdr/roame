'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  toast,
} from '@/components/ui';
import type { ApiError } from '@/lib/validation';

const selectClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-caption text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const ACTIONS = ['', 'WARN', 'REMOVE_CONTENT', 'SUSPEND_USER', 'BAN_USER', 'DISMISS', 'RESTORE'];

export function ResolveReport({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState('RESOLVED');
  const [action, setAction] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, action: action || undefined, notes: notes || undefined }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(body?.error.message ?? 'Failed to resolve report.');
      }
      toast.success('Report updated.');
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve report</DialogTitle>
          <DialogDescription>Set an outcome and, optionally, an action to apply.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="UNDER_REVIEW">Under review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="action">Action (optional)</Label>
            <select id="action" className={selectClass} value={action} onChange={(e) => setAction(e.target.value)}>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a || 'No action'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              className="rounded-md border border-input bg-background px-3 py-2 text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context for the audit trail…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button loading={pending} onClick={submit}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
