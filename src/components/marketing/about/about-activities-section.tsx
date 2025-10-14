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
    imageUrl: "/yoga-meditation.png",
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
    <section className="bg-background py-10 sm:py-12 overflow-hidden">
      <div className="container mx-auto px-4">
          {/* Section Title */}
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              What&apos;s On
            </span>
            <h2 className="2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground">
              Daily Activities & Rituals
            </h2>
            <p className="text-base text-muted-foreground md:text-lg max-w-3xl mx-auto">
              Discover simple daily practices and sacred rituals, from mindful gatherings to compassionate service, that nourish body, mind, and community.
            </p>
          </motion.div>

          {/* Activities Grid */}
          <motion.div
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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