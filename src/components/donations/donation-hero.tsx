import { Button } from "@/components/ui/button";

export function DonationHero() {
  return (
    <section className="relative overflow-hidden bg-primary/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Give with gratitude
          </p>
          <h1 className="text-4xl font-serif font-bold text-foreground sm:text-5xl">
            Your sewa keeps the ashram kitchens warm and hearts hopeful.
          </h1>
          <p className="text-lg text-muted-foreground">
            Every donation funds prasadam, education, and care for seekers who arrive in
            Rishikesh in search of peace. A single contribution can sponsor meals, daily
            rituals, or accommodation for those in need.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <a href="#donation-form">Donate now</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#impact">See impact</a>
            </Button>
          </div>
        </div>
        <div className="flex-1 rounded-3xl bg-white/70 p-6 shadow-lg backdrop-blur">
          <dl className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-muted-foreground">Meals served daily</dt>
              <dd className="text-3xl font-serif font-semibold text-primary">1,200+</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Students supported</dt>
              <dd className="text-3xl font-serif font-semibold text-primary">85</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Daily rituals</dt>
              <dd className="text-3xl font-serif font-semibold text-primary">6</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Care volunteers</dt>
              <dd className="text-3xl font-serif font-semibold text-primary">30</dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-muted-foreground">
            Relying entirely on community generosity, Sahajanand Wellness is run by devotees and
            volunteers. Your support keeps seva sustainable.
          </p>
        </div>
      </div>
    </section>
  );
}
