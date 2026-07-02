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
import { HelpCircle, MoreHorizontal, Plus, Power, Trash2 } from 'lucide-react';

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
}

export function FaqsManager({ rows }: { rows: FaqRow[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [category, setCategory] = React.useState('');

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
    const done = await call(
      '/api/admin/faqs',
      'POST',
      { question, answer, category: category || undefined },
      'FAQ created.',
    );
    if (done) {
      setOpen(false);
      setQuestion('');
      setAnswer('');
      setCategory('');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New FAQ</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="q">Question</Label>
                <Input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="a">Answer</Label>
                <textarea
                  id="a"
                  rows={4}
                  className="rounded-md border border-input bg-background px-3 py-2 text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="c">Category (optional)</Label>
                <Input id="c" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. billing" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={pending} disabled={!question || !answer} onClick={create}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No FAQs" description="Add common questions and answers." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="max-w-md">
                    <p className="font-medium text-foreground">{f.question}</p>
                    <p className="line-clamp-1 text-label text-muted-foreground">{f.answer}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.category ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={f.isActive ? 'success' : 'outline'}>{f.isActive ? 'Active' : 'Hidden'}</Badge>
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
                            call(`/api/admin/faqs/${f.id}`, 'PATCH', { isActive: !f.isActive }, 'Updated.')
                          }
                        >
                          <Power className="h-4 w-4" /> {f.isActive ? 'Hide' : 'Show'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onClick={() => call(`/api/admin/faqs/${f.id}`, 'DELETE', null, 'Deleted.')}
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
