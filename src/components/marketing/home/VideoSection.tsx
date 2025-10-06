"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const videos = [
  {
    id: "KU45jWBn57Y",
    title: "Divine Ganga Aarti",
  },
  {
    id: "V2CrSWlqkgA",
    title: "Enhancing Serenity & Charity Work",
  },
];

export function VideoSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="bg-gradient-to-b from-background to-secondary/20 pb-20 sm:pb-28 lg:pt-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center mb-4">
            <h3 className="text-4xl md:text-5xl font-bold font-serif text-foreground mr-4">
              Visual Journey
            </h3>
            <Image
              src="/om.png"
              alt="Meditation symbol"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Immerse yourself in the sights and sounds of Sahajanand Wellness,
            from the tranquil banks of the Ganga to the vibrant evening Aarti.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {videos.map((video) => (
            <motion.div
              key={video.id}
              variants={itemVariants}
              className="relative w-full overflow-hidden rounded-lg shadow-lg pt-[56.25%]"
            >
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&showinfo=0&rel=0`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h4 className="text-center text-xl font-serif font-semibold text-white">
                  {video.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}