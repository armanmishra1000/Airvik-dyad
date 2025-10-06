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
    src: "/sunilbhgat.png",
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
    <section className="bg-background py-16 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-4">
            Visual Journey
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            A visual journey through the sacred spaces and moments at Sahajanand
            Wellness.
          </p>
          <div className="flex justify-center">
            <Image
              src="/om.png"
              alt="Sahajanand Wellness"
              width={40}
              height={40}
              className="mt-4 sm:mt-6 object-contain"
            />
          </div>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card border border-border/50 rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
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