import Link from 'next/link';
import { Button } from '@/components/ui';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Compass className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-h3 font-semibold">Page not found</h1>
        <p className="mt-1 text-caption text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
