import * as React from 'react';
import { notFound } from 'next/navigation';
import { activityService } from '@/lib/services/activity-service';
import { getSession } from '@/lib/auth';
import { NotFoundError } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage, Badge, initials } from '@/components/ui';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { categoryIcon } from '@/components/site/category-icon';
import { JoinButton } from './join-button';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

function formatWhen(value: string | Date): string {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function ActivityDetailPage({ params }: Params) {
  const { id } = await params;
  const session = await getSession();

  let activity: Awaited<ReturnType<typeof activityService.getById>>;
  try {
    activity = await activityService.getById(id, session?.id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const Icon = categoryIcon(activity.category?.slug);
  const host = activity.host?.profile;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header band — solid surface + line icon, no gradient. */}
      <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-secondary/60">
        <Icon className="h-12 w-12 text-muted-foreground/70" strokeWidth={1.25} />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          {activity.category ? <Badge variant="neutral">{activity.category.name}</Badge> : null}
          <h1 className="text-h1 font-bold leading-tight tracking-tight">{activity.title}</h1>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <Row icon={<CalendarDays className="h-5 w-5" strokeWidth={1.75} />} label={formatWhen(activity.startsAt)} />
          {activity.city || activity.addressLine ? (
            <Row
              icon={<MapPin className="h-5 w-5" strokeWidth={1.75} />}
              label={[activity.addressLine, activity.city].filter(Boolean).join(', ')}
            />
          ) : null}
          <Row
            icon={<Users className="h-5 w-5" strokeWidth={1.75} />}
            label={`${activity._count.participants} going${activity.capacity ? ` · ${activity.capacity} spots` : ''}`}
          />
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {host?.avatarUrl ? <AvatarImage src={host.avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials(host?.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-label text-muted-foreground">Hosted by</p>
            <p className="text-caption font-medium text-foreground">{host?.displayName ?? 'Roamer'}</p>
          </div>
        </div>

        {activity.description ? (
          <div>
            <h2 className="mb-2 text-title font-semibold tracking-tight">About</h2>
            <p className="whitespace-pre-line text-body leading-relaxed text-muted-foreground">
              {activity.description}
            </p>
          </div>
        ) : null}

        <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <JoinButton activityId={activity.id} joined={activity.viewerJoined} authed={!!session} />
        </div>
      </div>
    </main>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-body text-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </div>
  );
}
