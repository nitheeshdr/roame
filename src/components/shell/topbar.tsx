'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { SessionUser } from '@/lib/validation';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ThemeToggle,
  initials,
  toast,
} from '@/components/ui';
import { LogOut } from 'lucide-react';
import { NAV_ITEMS } from './nav';

function titleForPath(pathname: string): string {
  if (pathname === '/admin') return 'Overview';
  const match = NAV_ITEMS.find((i) => i.href !== '/admin' && pathname.startsWith(i.href));
  return match?.label ?? 'Roame Admin';
}

export function Topbar({ user }: { user: SessionUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const title = titleForPath(pathname);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Signed out.');
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <h1 className="text-title font-semibold tracking-tight">{title}</h1>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials(user.displayName ?? user.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-caption font-medium text-foreground">
                  {user.displayName ?? 'Admin'}
                </span>
                <span className="truncate text-label text-muted-foreground">
                  {user.email ?? user.phone}
                </span>
                <span className="mt-1 w-fit rounded-full bg-primary/10 px-2 py-0.5 text-label font-medium text-primary">
                  {user.role}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
