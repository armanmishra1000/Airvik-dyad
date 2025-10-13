"use client";

import { motion, type Variants } from "framer-motion";
import {
  Flame,
  MoonStar,
  Music,
  Soup,
  UtensilsCrossed,
  Wind,
} from "lucide-react";
import type { ComponentType } from "react";
import { GrYoga } from "react-icons/gr";

type RhythmItem = {
  time: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const dailyRhythm: RhythmItem[] = [
  {
    time: "06:00",
    title: "Yoga",
    description:
      "Easy yoga stretches and deep breathing near the Ganga to refresh your body and calm your mind.",
    icon: GrYoga,
  },
  {
    time: "07:00",
    title: "Breakfast",
    description:
      "A healthy vegetarian breakfast with herbal tea — a quiet time to relax after morning yoga.",
    icon: UtensilsCrossed,
  },
  {
    time: "08:00",
    title: "Morning Hawan",
    description:
      "A simple fire ritual with chanting for peace, positivity, and a fresh start to your day.",
    icon: Flame,
  },
  {
    time: "12:00",
    title: "Lunch",
    description:
      "A light, healthy lunch made with Ayurvedic ingredients and a short breathing practice before eating.",
    icon: Soup,
  },
  {
    time: "18:00",
    title: "Ganga Aarti + Meditation",
    description:
      "Divine Evening Bliss: Evening rituals by the Ganga with devotional songs, meditation, and peaceful prayers.",
    icon: Music,
  },
  {
    time: "19:00",
    title: "Dinner",
    description:
      "Enjoy dinner by the river with soft chants, light lamps, and a calm atmosphere to end your day.",
    icon: MoonStar,
  },
];

const MORNING_TIMES = new Set(["06:00", "07:00", "08:00"]);
const AFTERNOON_TIMES = new Set(["12:00", "18:00", "19:00"]);

const rhythmGroups: { title: string; items: RhythmItem[] }[] = [
  {
    title: "Morning",
    items: dailyRhythm.filter((item) => MORNING_TIMES.has(item.time)),
  },
  {
    title: "Afternoon",
    items: dailyRhythm.filter((item) => AFTERNOON_TIMES.has(item.time)),
  },
];

const MOBILE_SECTION_MARKERS: Record<string, string> = {
  "06:00": "Morning",
  "12:00": "Afternoon",
};

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
    <section className="py-10 lg:py-12">
      <div className="container mx-auto sm:px-6 px-4 space-y-12">
        <motion.div
          className="space-y-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground">
            Daily Life at the Ashram
          </h2>
          <div className="flex justify-center">
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
              From sunrise meditation to evening chants, each moment flows with
              mindful intention guiding you to live in harmony with nature and
              your inner self.
            </p>
          </div>
        </motion.div>

        <div className="space-y-10">
          <motion.div
            className="flex flex-col md:hidden"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {dailyRhythm.map(
              ({ time, title: itemTitle, description, icon: Icon }, index) => {
                const sectionTitle = MOBILE_SECTION_MARKERS[time];
                const isLastItem = index === dailyRhythm.length - 1;

                return (
                  <motion.div
                    key={time}
                    variants={itemVariants}
                    className="relative flex gap-4"
                  >
                    <div className="flex flex-col items-center self-stretch">
                      <div className="flex items-center justify-center size-12 flex-shrink-0 text-xs rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold">
                        {time}
                      </div>
                      {!isLastItem && (
                        <>
                          <span className="flex-1 w-px border border-primary/30" />
                          <span className="h-6 w-px border border-primary/30" />
                        </>
                      )}
                    </div>
                    <div className="flex-1 rounded-2xl border mb-5 border-border/50 bg-card/70 backdrop-blur-sm p-4 shadow-lg shadow-primary/5 space-y-3">
                      {sectionTitle && (
                        <span className="text-xs font-semibold text-right uppercase tracking-wide text-primary">
                          {sectionTitle}
                        </span>
                      )}
                      <div className="flex items-center gap-3 text-sm font-medium text-primary">
                        <Icon className="size-4" />
                        {itemTitle}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </motion.div>
                );
              }
            )}
          </motion.div>

          <div className="hidden md:grid md:grid-cols-2 lg:gap-12 gap-6">
            {rhythmGroups.map(({ title, items }) => (
              <div key={title} className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-primary">{title}</p>
                </div>
                <motion.div
                  className="flex flex-col"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {items.map(
                    (
                      { time, title: itemTitle, description, icon: Icon },
                      index
                    ) => (
                      <motion.div
                        key={time}
                        variants={itemVariants}
                        className="relative flex gap-4"
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="flex items-center justify-center lg:size-14 size-12 flex-shrink-0 lg:text-sm text-xs rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold">
                            {time}
                          </div>
                          {index < items.length - 1 && (
                            <div className="h-full w-px border border-primary/30" />
                          )}
                        </div>
                        <div className="flex-1 rounded-2xl border lg:mb-8 mb-5 border-border/50 bg-card/70 backdrop-blur-sm sm:p-6 p-4 shadow-lg shadow-primary/5 space-y-3">
                          <div className="flex items-center gap-3 font-medium text-primary">
                            <Icon className="size-5" />
                            {itemTitle}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
