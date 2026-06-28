import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { Compass, MapPin, Users, CalendarHeart } from 'lucide-react';

const FEATURES = [
  { icon: MapPin, title: 'Hyperlocal discovery', body: 'Find activities happening within walking distance, right now.' },
  { icon: Users, title: 'Real connections', body: 'Meet people who share your interests, in person — not just online.' },
  { icon: CalendarHeart, title: 'Host in seconds', body: 'Spin up an activity, invite your circle, and manage RSVPs effortlessly.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </span>
          <span className="text-title font-semibold">Roame</span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin">Admin</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-label font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Coming soon
        </span>
        <h1 className="mt-6 text-display font-bold tracking-tight">
          Find your people, <span className="text-primary">near you.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body text-muted-foreground">
          Roame helps you discover, create, and join real-world activities happening around you —
          from morning runs to rooftop jam sessions.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg">Get the app</Button>
          <Button size="lg" variant="secondary">
            Learn more
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent className="flex flex-col gap-3 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-title font-semibold">{title}</h3>
              <p className="text-caption text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-label text-muted-foreground">
          © {new Date().getFullYear()} Roame · This is a Milestone-1 scaffold.
        </div>
      </footer>
    </main>
  );
}
