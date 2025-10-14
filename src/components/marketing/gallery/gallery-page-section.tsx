"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const galleryImages = [
  {
    src: "/havan.png",
    alt: "Saints performing a havan ceremony at the ashram.",
  },
  {
    src: "/Trayambakeshwar_Temple_VK.jpg",
    alt: "Exterior view of a temple at Sahajanand Wellness.",
  },
  {
    src: "/rishikesh-ahsram.png",
    alt: "Front view of the Sahajanand Wellness ashram building.",
  },
  {
    src: "/ashram-stay.png",
    alt: "A serene pathway within the ashram premises.",
  },
  {
    src: "/gallery-room-05-2-1.png",
    alt: "A clean and simple room for guests at the ashram.",
  },
  {
    src: "/annakshetra.png",
    alt: "The Annakshetra, where meals are served to all.",
  },
  {
    src: "/gausala.webp",
    alt: "Cows being cared for at the ashram's Gaushala.",
  },
  {
    src: "/ved-pathsala.png",
    alt: "Young scholars at the Veda-Pathshala.",
  },
  {
    src: "/ganga-arti.jpg",
    alt: "Evening Ganga Aarti ceremony.",
  },
  {
    src: "/swami.jpeg",
    alt: "Spiritual guide Sunil Bhagat (Swami).",
  },
  {
    src: "/ganga-rishikesh.jpg",
    alt: "A scenic view of the Ganga river in Rishikesh.",
  },
  {
    src: "/about-goshala-2.jpg",
    alt: "A cow at the Gaushala.",
  },
];

export function GalleryPageSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="bg-background py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
        >
          <h1 className="2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground">
            <span className="block sm:inline">Ashram Moments</span>
            <span className="sm:inline"> of Peace</span>
          </h1>
          <p className="text-base text-muted-foreground md:text-lg max-w-xl mx-auto">
            Experience the serenity, devotion, and beauty of our Ashram through
            these captured moments
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
