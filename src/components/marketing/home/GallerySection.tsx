"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const galleryImages = [
  {
    src: "/Trayambakeshwar_Temple_VK.jpg",
    alt: "Exterior view of the Sahajanand Wellness ashram building",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    src: "/ganga-rishikesh.jpg",
    alt: "Ganga Aarti ceremony with a large crowd",
  },
  {
    src: "/havan.png",
    alt: "The dining hall (Annakshetra) at the ashram",
  },
  {
    src: "/ved-pathsala.png",
    alt: "Priests performing the Ganga Aarti at night",
  },
  {
    src: "/gallery-room-05-2-1.png",
    alt: "A spiritual ceremony taking place at the ashram",
  },
];

/**
 * Renders a responsive, animated image gallery section with a heading and decorative Om image.
 *
 * The section displays a centered title and subtitle, then a responsive image grid (2 columns on small screens,
 * 4 columns on medium+). Grid items animate into view with staggered scale/fade effects and each tile uses
 * Next.js Image with object-cover to fill its cell. Image `alt` text from the gallery data is preserved for accessibility.
 */
export function GallerySection() {
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
    <section className="bg-background py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-4">
            Glimpses of Serenity
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A visual journey through the sacred spaces and moments at Sahajanand
            Wellness.
          </p>
          <div className="flex justify-center mb-2">
            <Image
              src="/om.png"
              alt="Sahajanand Wellness"
              width={40}
              height={40}
              className="mt-6 object-contain"
            ></Image>
          </div>
        </motion.div>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[250px] gap-4 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={cn(
                "relative overflow-hidden rounded-lg shadow-lg group",
                image.className
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}