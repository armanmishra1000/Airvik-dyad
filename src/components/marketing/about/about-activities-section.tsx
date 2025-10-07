"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ActivityInfoCard } from "./activity-info-card";

const activities = [
  {
    title: "Annakshetra",
    description: "Serving daily, wholesome meals to all pilgrims and saints.",
    imageUrl: "/ann.jpg",
  },
  {
    title: "Yoga & Meditation",
    description: "Daily sessions to harmonize mind, body, and soul.",
    imageUrl: "/yoga-meditation.jpg",
  },
  {
    title: "Veda-Pathshala",
    description: "Preserving ancient wisdom through traditional Vedic education.",
    imageUrl: "/veda3.webp",
  },
  {
    title: "Gaushala",
    description: "A loving sanctuary providing care for our sacred cows.",
    imageUrl: "/gausala.webp",
  },
  {
    title: "Ganga Aarti",
    description: "Experience the divine evening worship on our private ghat.",
    imageUrl: "/ganga-arti.jpg",
  },
  {
    title: "Havan",
    description:
      "Participate in sacred fire ceremonies for purification and peace.",
    imageUrl: "/havan.png",
  },
];

export function AboutActivitiesSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
          {/* Section Title */}
          <motion.div
            className="mx-auto max-w-7xl space-y-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">
              Community Offerings
            </span>
            <h2 className="text-4xl font-serif font-bold leading-tight text-foreground md:text-5xl">
              Our Sacred Activities
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Discover the daily practices and sacred rituals that nourish every visitor—from mindful gatherings to compassionate service.
            </p>
          </motion.div>

          {/* Activities Grid */}
          <motion.div
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {activities.map((activity) => (
              <motion.div key={activity.title} variants={itemVariants}>
                <ActivityInfoCard
                  title={activity.title}
                  description={activity.description}
                  imageUrl={activity.imageUrl}
                  className="h-full"
                />
              </motion.div>
            ))}
          </motion.div>
      </div>
    </section>
  );
}