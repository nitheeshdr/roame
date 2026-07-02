import * as React from 'react';
import { getSession } from '@/lib/auth';
import { SiteHeader } from '@/components/site/site-header';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-label text-muted-foreground">
          © {new Date().getFullYear()} Roame — find your people, near you.
        </div>
      </footer>
    </div>
  );
}
