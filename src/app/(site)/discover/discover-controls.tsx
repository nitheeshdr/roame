'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input, cn } from '@/components/ui';
import { Search } from 'lucide-react';
import { categoryIcon } from '@/components/site/category-icon';

export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

export function DiscoverControls({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get('q') ?? '');
  const activeCategory = params.get('categoryId') ?? '';

  const setParam = React.useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  React.useEffect(() => {
    const current = params.get('q') ?? '';
    if (q === current) return;
    const t = setTimeout(() => setParam('q', q.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative mx-auto w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search activities…"
          className="h-12 rounded-full pl-11 text-body"
          aria-label="Search activities"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        <CategoryChip label="All" active={!activeCategory} onClick={() => setParam('categoryId', '')} />
        {categories.map((c) => {
          const Icon = categoryIcon(c.slug);
          return (
            <CategoryChip
              key={c.id}
              label={c.name}
              icon={<Icon className="h-4 w-4" strokeWidth={1.75} />}
              active={activeCategory === c.id}
              onClick={() => setParam('categoryId', activeCategory === c.id ? '' : c.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-caption font-medium transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}
