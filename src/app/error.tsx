'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-h3 font-semibold">Something went wrong</h1>
        <p className="mt-1 max-w-sm text-caption text-muted-foreground">
          An unexpected error occurred. You can try again, and if it keeps happening, check the
          server logs.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
