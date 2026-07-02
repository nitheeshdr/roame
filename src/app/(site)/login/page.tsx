import * as React from 'react';
import { redirect } from 'next/navigation';
import { Compass } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { GoogleSignin } from './google-signin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in · Roame' };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/discover');

  return (
    <main className="mx-auto flex max-w-sm flex-col items-center px-6 py-20 text-center sm:py-28">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Compass className="h-6 w-6" strokeWidth={2} />
      </span>
      <h1 className="mt-6 text-h2 font-semibold tracking-tight">Welcome to Roame</h1>
      <p className="mt-2 text-caption text-muted-foreground">
        Sign in to discover and join activities near you.
      </p>

      <div className="mt-8 w-full">
        <React.Suspense fallback={null}>
          <GoogleSignin />
        </React.Suspense>
      </div>

      <p className="mt-8 max-w-xs text-label leading-relaxed text-muted-foreground">
        By continuing you agree to Roame&apos;s Terms and acknowledge our Privacy Policy.
      </p>
    </main>
  );
}
