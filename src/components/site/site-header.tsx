'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SessionUser } from '@/lib/validation';
import {
  Avatar,
  AvatarFallback,
  Button,
  ThemeToggle,
  cn,
  initials,
} from '@/components/ui';
import { Compass } from 'lucide-react';

const LINKS = [
  { href: '/discover', label: 'Discover' },
  { href: '/#how', label: 'How it works' },
];

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="text-title font-semibold tracking-tight">Roame</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-md px-3 py-2 text-caption font-medium transition-colors',
                pathname === l.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link href="/discover" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-caption">
                  {initials(user.displayName ?? user.phone ?? user.email)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
