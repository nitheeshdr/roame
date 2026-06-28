import * as React from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';
import { cn } from './cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Elegant empty state with a custom illustration ring around a Lucide icon. */
function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center',
        className,
      )}
      {...props}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 -m-3 rounded-full bg-primary/5" aria-hidden />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      </div>
      <h3 className="text-title font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-caption text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
