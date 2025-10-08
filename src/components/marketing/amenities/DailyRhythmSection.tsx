"use client";

import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Leaf, MoonStar, Sunrise, UtensilsCrossed } from "lucide-react";

type RhythmItem = {
  time: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const dailyRhythm: RhythmItem[] = [
  {
    time: "05:45",
    title: "Sunrise Satsang",
    description:
      "Begin with guided meditation, vedic chanting, and gentle breathwork to align your intentions with the day ahead.",
    icon: Sunrise,
  },
  {
    time: "09:00",
    title: "Holistic Nourishment",
    description:
      "Sattvic breakfast paired with herbal tonics, followed by optional yoga therapy or personalised consultations.",
    icon: UtensilsCrossed,
  },
  {
    time: "15:30",
    title: "Rest & Reflection",
    description:
      "Afternoon tea at the herbal lounge, journaling corners, and mindful art sessions in the creative studio.",
    icon: Leaf,
  },
  {
    time: "19:15",
    title: "Evening Aarti",
    description:
      "Gather by the Ganges for the golden glow of diyas, sacred hymns, and a nourishing supper to conclude the day.",
    icon: MoonStar,
  },
];

/**
 * Renders an animated, responsive "daily rhythm" section showing a timed itinerary.
 *
 * Displays a header with title and subtitle, then a two-column (on medium+ screens) animated timeline of rhythm items.
 * Each item shows a circular time badge, an optional connecting line, and a card with an icon, title, and description.
 *
 * @returns The rendered section element containing the animated daily rhythm schedule.
 */
export function DailyRhythmSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          className="max-w-2xl space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl">
            A gentle cadence to anchor your stay
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Every amenity interweaves with a mindful itinerary that guides you
            from dawn to dusk with grace and intention.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {dailyRhythm.map(
            ({ time, title, description, icon: Icon }, index) => (
              <motion.div
                key={time}
                variants={itemVariants}
                className="relative flex gap-4"
              >
                <div className="relative flex flex-col items-center">
                  <div className="flex items-center justify-center h-14 w-14 flex-shrink-0 rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold">
                    {time}
                  </div>
                  {index < dailyRhythm.length - 1 && (
                    <div className="hidden h-full w-px bg-border md:block" />
                  )}
                </div>
                <div className="flex-1 rounded-3xl border border-border/50 bg-card/70 backdrop-blur-sm p-6 shadow-lg shadow-primary/5 space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-primary">
                    <Icon className="h-4 w-4" />
                    {title}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}