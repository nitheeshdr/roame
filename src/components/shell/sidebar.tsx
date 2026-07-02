'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Lock } from 'lucide-react';
import { cn } from '@/components/ui';
import { NAV_ITEMS } from './nav';

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  /** Called when a nav link is tapped — used by the mobile drawer to close. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-border bg-card px-4 py-5',
        className,
      )}
    >
      <Link href="/admin" onClick={onNavigate} className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Compass className="h-4 w-4" />
        </span>
        <span className="text-title font-semibold tracking-tight">Roame</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-label font-medium text-muted-foreground">
          Admin
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center justify-between gap-3 rounded-md px-3 py-2 text-caption text-muted-foreground/60"
                title="Coming in a later milestone"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <Lock className="h-3.5 w-3.5" />
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-caption font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="px-3 text-label text-muted-foreground">Roame Admin · v0.1.0</p>
    </aside>
  );
}
