"use client";

import React from "react";
import { motion } from "framer-motion";
import { ActivityInfoCard } from "./activity-info-card";

const attractions = [
  {
    title: "Triveni Ghat",
    description:
      "The largest and most sacred bathing ghat in Rishikesh, famous for its mesmerizing evening Ganga Aarti ceremony where thousands of lamps are floated on the river.",
    imageUrl: "/triveni-ghat-rishikesh-uttarakhand.jpg",
  },
  {
    title: "Ram Jhula / Lakshman Jhula",
    description:
      "Iconic suspension bridges offering breathtaking panoramic views of the Ganga and the surrounding temples. A walk across is a quintessential Rishikesh experience.",
    imageUrl: "/ram-lkshmanjula.webp",
  },
  {
    title: "Bungee Jumping",
    description:
      "Rishikesh is also known for its bungee jumping facility, which provides an adrenaline-pumping experience as you leap from a height and feel the rush of free fall.",
    imageUrl: "/bungee.webp",
  },
  {
    title: "Ganga Aarti",
    description:
      "Witness the divine evening worship on the banks of the holy Ganga, a truly mesmerizing and spiritual experience.",
    imageUrl: "/rishikesh-ganga-aarti-.png",
  },
  {
    title: "Adventure Spots",
    description:
      "For thrill-seekers, Rishikesh is a hub for adventure sports like white-water rafting, bungee jumping, and kayaking in the holy Ganges.",
    imageUrl: "/Rishikesh-rafting.jpg",
  },
  {
    title: "Mountain Escapes",
    description:
      "Explore the serene Himalayan foothills with treks to hidden waterfalls, ancient caves like Vashishta Gufa, and viewpoints offering stunning sunrise vistas.",
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
    <section className="bg-muted/50 py-10 lg:py-28 md:py-18">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
            Key Experiences & Attractions
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
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