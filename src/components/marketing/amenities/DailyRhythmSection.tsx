"use client";

import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  Flame,
  MoonStar,
  Music,
  Soup,
  Sunrise,
  UtensilsCrossed,
  Wind,
} from "lucide-react";

type RhythmItem = {
  time: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const dailyRhythm: RhythmItem[] = [
  {
    time: "05:15",
    title: "Morning Bell & Quiet Start",
    description:
      "The gentle bell rings to begin the day. Everyone wakes up peacefully and spends a few moments in silence.",
    icon: BellRing,
  },
  {
    time: "05:45",
    title: "Sunrise Meditation",
    description:
      "Start the morning with guided meditation, soft chanting, and calm breathing as the sun rises.",
    icon: Sunrise,
  },
  {
    time: "06:45",
    title: "Pranayama by the Ganga",
    description:
      "Gentle yoga movements and breathing exercises beside the Ganga help refresh body and mind.",
    icon: Wind,
  },
  {
    time: "08:00",
    title: "Morning Fire Prayer",
    description:
      "A small fire ceremony with mantra chanting and blessings to begin the day with good energy.",
    icon: Flame,
  },
  {
    time: "09:00",
    title: "Sattvic Breakfast",
    description:
      "A healthy vegetarian breakfast with herbal tea and quiet time to relax after morning practice.",
    icon: UtensilsCrossed,
  },
  {
    time: "12:00",
    title: "Ayurvedic Lunch",
    description:
      "A fresh, balanced lunch prepared with Ayurvedic recipes and a short breathing practice before eating.",
    icon: Soup,
  },
  {
    time: "18:00",
    title: "Temple Prayer & Music",
    description:
      "Evening temple rituals with live devotional singing and peaceful prayer time.",
    icon: Music,
  },
  {
    time: "19:15",
    title: "Evening Aarti by the Ganga",
    description:
      "Gather by the river for evening aarti with diyas, chanting, and closing reflections for the day.",
    icon: MoonStar,
  },
];

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
    <section className="pb-10">
      <div className="container mx-auto sm:px-6 px-4 space-y-12">
        <motion.div
          className="xl:max-w-2xl space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="sm:text-3xl text-2xl lg:text-4xl">
            The Sacred Flow of a Day at the Ashram
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            From sunrise meditation to evening chants, each moment flows with
            mindful intention guiding you to live in harmony with nature and
            your inner self.
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
                  <div className="flex items-center justify-center lg:size-14 size-12 flex-shrink-0 lg:text-sm text-xs rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold">
                    {time}
                  </div>
                  {index < dailyRhythm.length - 1 && (
                    <div className="hidden h-full w-px bg-border md:block" />
                  )}
                </div>
                <div className="flex-1 rounded-3xl border border-border/50 bg-card/70 backdrop-blur-sm sm:p-6 p-4 shadow-lg shadow-primary/5 space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-primary">
                    <Icon className="size-4" />
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
