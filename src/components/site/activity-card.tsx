import Link from 'next/link';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, Badge, initials } from '@/components/ui';
import { categoryIcon } from './category-icon';

export interface ActivityCardData {
  id: string;
  title: string;
  startsAt: string | Date;
  city: string | null;
  category: { name: string; slug?: string } | null;
  host: { profile: { displayName: string; avatarUrl: string | null } | null } | null;
  _count: { participants: number };
}

function formatWhen(value: string | Date): string {
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Premium activity card — line icons, no imagery gradients, calm surfaces. */
export function ActivityCard({ activity }: { activity: ActivityCardData }) {
  const Icon = categoryIcon(activity.category?.slug);
  const host = activity.host?.profile;

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Calm header band with a single line icon — no gradient. */}
      <div className="relative flex h-28 items-center justify-center border-b border-border bg-secondary/60">
        <Icon className="h-8 w-8 text-muted-foreground/70" strokeWidth={1.5} />
        {activity.category ? (
          <Badge variant="neutral" className="absolute left-3 top-3 bg-card">
            {activity.category.name}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-title font-semibold leading-snug tracking-tight text-foreground">
          {activity.title}
        </h3>

        <div className="mt-auto flex flex-col gap-1.5 text-caption text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {formatWhen(activity.startsAt)}
          </span>
          {activity.city ? (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {activity.city}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {host?.avatarUrl ? <AvatarImage src={host.avatarUrl} alt="" /> : null}
              <AvatarFallback className="text-[10px]">{initials(host?.displayName)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-label text-muted-foreground">
              {host?.displayName ?? 'Roamer'}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-label text-muted-foreground">
            <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
            {activity._count.participants} going
          </span>
        </div>
      </div>
    </Link>
  );
}
