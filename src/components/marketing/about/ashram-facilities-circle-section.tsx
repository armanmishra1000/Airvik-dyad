"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Image from "next/image";
import React from "react";

interface Facility {
  imageUrl: string;
  title: string;
}

const facilities: Facility[] = [
  {
    imageUrl: "/ACNon-AC Rooms.png",
    title: "AC/Non-AC Rooms",
  },
  {
    imageUrl: "/Dining Hall.png",
    title: "Dining Hall",
  },
  {
    imageUrl: "/Spiritual Spaces.png",
    title: "Spiritual Spaces",
  },
  {
    imageUrl: "/yoga-meditation.jpg",
    title: "Wellness Amenities",
  },
  {
    imageUrl: "/Trayambakeshwar_Temple_VK.jpg",
    title: "Accommodation",
  },
];

const FacilityCircleCard = ({ imageUrl, title }: Facility) => (
  <div className="flex flex-col items-center text-center gap-4">
    <div className="relative h-28 w-28 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <h3 className="text-lg font-semibold text-foreground mt-2">{title}</h3>
  </div>
);

/**
 * Renders the "Ashram Facilities & Spaces" section with an animated heading and a responsive grid of circular facility cards.
 *
 * The grid items animate into view with a staggered vertical fade-in and each card supports hover interactions.
 *
 * @returns A React element containing the animated section with facility cards.
 */
export function AshramFacilitiesCircleSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
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
    <section className="py-10 lg:py-20 md:py-14">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
            Ashram Facilities & Spaces
          </h2>
        </motion.div>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {facilities.map((facility) => (
            <motion.div
              key={facility.title}
              variants={itemVariants}
              className="group"
            >
              <FacilityCircleCard
                imageUrl={facility.imageUrl}
                title={facility.title}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}