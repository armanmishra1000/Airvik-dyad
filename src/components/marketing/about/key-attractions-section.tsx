"use client";

import React from "react";
import { motion } from "framer-motion";
import { ActivityInfoCard } from "./activity-info-card";

const attractions = [
  {
    title: "Triveni Ghat",
    description:
      "The holiest bathing ghat in Rishikesh, known for its peaceful Ganga Aarti and sacred vibe.",
    imageUrl: "/triveni-ghat-rishikesh-uttarakhand.jpg",
  },
  {
    title: "Ram Jhula / Lakshman Jhula",
    description:
      "Famous suspension bridges offering stunning Ganga views and a classic Rishikesh walk.",
    imageUrl: "/ram-lkshmanjula.webp",
  },
  {
    title: "Bungee Jumping",
    description:
      "Experience an adrenaline rush as you leap from great heights into nature’s beauty.",
    imageUrl: "/bungee.webp",
  },
  {
    title: "Ganga Aarti",
    description:
      "Witness the divine evening prayers on the banks of the Ganga — a soulful experience.",
    imageUrl: "/rishikesh-ganga-aarti-.png",
  },
  {
    title: "Adventure Spots",
    description:
      "Enjoy thrilling adventures like rafting, bungee jumping, and kayaking in Rishikesh.",
    imageUrl: "/Rishikesh-rafting.jpg",
  },
  {
    title: "Mountain Escapes",
    description:
      "Explore peaceful hills, hidden waterfalls, and sunrise views in the Himalayas.",
    imageUrl: "/Mountain Escape.jpg",
  },
];

export function KeyAttractionsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-10 sm:py-12" id="rishikesh-experience">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto max-w-3xl lg:text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Discover Rishikesh
          </p>
          <h2 className="2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground">
            Key Experiences & Attractions
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            A curated selection of calm spaces, sacred rituals, and uplifting
            adventures to help you experience the heart of Rishikesh at your own
            pace.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mt-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {attractions.map((attraction) => (
            <motion.div key={attraction.title} variants={itemVariants}>
              <ActivityInfoCard
                title={attraction.title}
                description={attraction.description}
                imageUrl={attraction.imageUrl}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
