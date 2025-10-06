"use client";

import { motion } from "framer-motion";
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
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="bg-muted/50 py-14 lg:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
            Our Sacred Activities
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
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