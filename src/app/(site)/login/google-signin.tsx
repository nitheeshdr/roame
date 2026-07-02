'use client';

import * as React from 'react';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui';
import type { ApiError } from '@/lib/validation';

/* Minimal typing for the Google Identity Services global. */
interface GoogleId {
  accounts: {
    id: {
      initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void }) => void;
      renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
    };
  };
}
declare global {
  interface Window {
    google?: GoogleId;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleSignin() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/discover';
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);

  const handleCredential = React.useCallback(
    async (credential: string) => {
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        });
        if (!res.ok) {
          const b = (await res.json().catch(() => null)) as ApiError | null;
          throw new Error(b?.error.message ?? 'Sign in failed.');
        }
        toast.success('Welcome to Roame.');
        router.replace(next);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Sign in failed.');
      }
    },
    [next, router],
  );

  const init = React.useCallback(() => {
    if (!CLIENT_ID || !window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (r) => handleCredential(r.credential),
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'center',
      width: 320,
    });
    setReady(true);
  }, [handleCredential]);

  if (!CLIENT_ID) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-caption text-muted-foreground">
        Google sign-in isn&apos;t configured yet. Set{' '}
        <code className="font-mono text-foreground">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> (from Google
        Cloud Console) to enable it.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={init} />
      <div ref={buttonRef} className="min-h-[44px]" />
      {!ready ? <p className="text-label text-muted-foreground">Loading Google sign-in…</p> : null}
    </div>
  );
}
