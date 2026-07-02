'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@/components/ui';
import type { ApiError } from '@/lib/validation';
import { Eye, EyeOff, Megaphone, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

export interface AnnouncementRow {
  id: string;
  title: string;
  audience: string;
  isPublished: boolean;
  createdAt: string | Date;
}

const AUDIENCES = ['ALL', 'USERS', 'HOSTS', 'ADMINS'];

export function AnnouncementsManager({ rows }: { rows: AnnouncementRow[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [audience, setAudience] = React.useState('ALL');

  async function call(url: string, method: string, payload: unknown, success: string) {
    setPending(true);
    try {
      const res = await fetch(url, {
        method,
        headers: payload ? { 'Content-Type': 'application/json' } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(b?.error.message ?? 'Action failed.');
      }
      toast.success(success);
      router.refresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
      return false;
    } finally {
      setPending(false);
    }
  }

  async function create() {
    const okDone = await call(
      '/api/admin/announcements',
      'POST',
      { title, body, audience, isPublished: false },
      'Announcement created.',
    );
    if (okDone) {
      setOpen(false);
      setTitle('');
      setBody('');
      setAudience('ALL');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New announcement</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="body">Body</Label>
                <textarea
                  id="body"
                  rows={4}
                  className="rounded-md border border-input bg-background px-3 py-2 text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="audience">Audience</Label>
                <select
                  id="audience"
                  className="h-10 rounded-md border border-input bg-background px-3 text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={pending} disabled={!title || !body} onClick={create}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="Create one to notify your community." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-foreground">{a.title}</TableCell>
                  <TableCell>
                    <Badge variant="neutral">{a.audience}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.isPublished ? 'success' : 'outline'}>
                      {a.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions" disabled={pending}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            call(
                              `/api/admin/announcements/${a.id}`,
                              'PATCH',
                              { isPublished: !a.isPublished },
                              a.isPublished ? 'Unpublished.' : 'Published.',
                            )
                          }
                        >
                          {a.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {a.isPublished ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onClick={() =>
                            call(`/api/admin/announcements/${a.id}`, 'DELETE', null, 'Deleted.')
                          }
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
