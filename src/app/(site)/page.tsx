import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { MapPin, Users, CalendarPlus, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Hyperlocal discovery',
    body: 'See what is happening within walking distance — filtered to your city and interests.',
  },
  {
    icon: Users,
    title: 'Real connections',
    body: 'Meet people who share your interests in person, not just another feed to scroll.',
  },
  {
    icon: CalendarPlus,
    title: 'Host in seconds',
    body: 'Create an activity, set a capacity, and manage RSVPs and check-ins effortlessly.',
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero — solid surfaces, generous type, no gradient. */}
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-label font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Now in your city
        </span>
        <h1 className="mt-6 text-display font-bold leading-[1.05] tracking-tight">
          Find your people,
          <br />
          <span className="text-primary">near you.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-body text-muted-foreground">
          Roame helps you discover, create, and join real-world activities happening around you —
          from morning runs to rooftop sessions.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/discover">
              Explore activities
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="border-border">
            <CardContent className="flex flex-col gap-3 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="text-title font-semibold tracking-tight">{title}</h3>
              <p className="text-caption leading-relaxed text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
