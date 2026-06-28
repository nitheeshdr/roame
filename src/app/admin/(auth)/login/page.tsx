import * as React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';
import { isMockAuth } from '@/lib/env';
import { LoginForm } from './login-form';

export const metadata = { title: 'Sign in · Roame Admin' };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden flex-col justify-between bg-foreground p-12 text-background lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </span>
          <span className="text-title font-semibold">Roame</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-display font-bold leading-tight tracking-tight">
            Run the world&apos;s most local network.
          </h1>
          <p className="mt-4 text-body text-background/70">
            Moderate activity, manage members, and keep the community safe — all from one
            calm, fast control room.
          </p>
        </div>

        <div className="flex items-center gap-2 text-caption text-background/60">
          <ShieldCheck className="h-4 w-4" />
          Authorized administrators only.
        </div>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-in-scale">
          <div className="mb-8 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="h-5 w-5" />
            </span>
          </div>

          <h2 className="text-h2 font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1 text-caption text-muted-foreground">
            Enter your admin credentials to continue.
          </p>

          <div className="mt-8">
            <React.Suspense fallback={null}>
              <LoginForm />
            </React.Suspense>
          </div>

          {isMockAuth ? (
            <div className="mt-6 rounded-lg border border-dashed border-border bg-secondary/50 p-3 text-label text-muted-foreground">
              <span className="font-medium text-foreground">Dev mode:</span> seeded admin is{' '}
              <code className="font-mono">admin@admin.com</code> /{' '}
              <code className="font-mono">admin123</code>.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
