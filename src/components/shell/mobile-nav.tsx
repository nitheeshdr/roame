'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import { Sidebar } from './sidebar';

/**
 * Mobile navigation: a hamburger button (hidden on lg+) that opens the admin
 * sidebar in a left slide-in drawer. Closes automatically on route change.
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar className="w-full border-0" onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
