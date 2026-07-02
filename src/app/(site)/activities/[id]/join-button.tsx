'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, toast } from '@/components/ui';
import type { ApiError } from '@/lib/validation';
import { Check, LogIn } from 'lucide-react';

export function JoinButton({
  activityId,
  joined,
  authed,
}: {
  activityId: string;
  joined: boolean;
  authed: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [isJoined, setIsJoined] = React.useState(joined);

  if (!authed) {
    return (
      <Button asChild size="lg" className="w-full sm:w-auto">
        <a href={`/login?next=/activities/${activityId}`}>
          <LogIn className="h-4 w-4" strokeWidth={2} />
          Sign in to join
        </a>
      </Button>
    );
  }

  async function toggle() {
    setPending(true);
    try {
      const res = await fetch(`/api/activities/${activityId}/${isJoined ? 'leave' : 'join'}`, {
        method: isJoined ? 'DELETE' : 'POST',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(body?.error.message ?? 'Something went wrong.');
      }
      setIsJoined(!isJoined);
      toast.success(isJoined ? 'You left this activity.' : "You're in. See you there.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      size="lg"
      variant={isJoined ? 'secondary' : 'primary'}
      loading={pending}
      onClick={toggle}
      className="w-full sm:w-auto"
    >
      {isJoined ? (
        <>
          <Check className="h-4 w-4" strokeWidth={2} />
          Going
        </>
      ) : (
        'Join activity'
      )}
    </Button>
  );
}
