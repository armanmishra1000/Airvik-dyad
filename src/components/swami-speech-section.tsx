"use client";

import React from "react";
import { motion, easeOut } from "framer-motion";
import Image from "next/image";

const mainVideoId = "rSnrtdSB8RA";
const otherVideos = [
  { id: "RHaosnSo70k", title: "Discourse on Dharma" },
  { id: "VcXQFtzjXJI", title: "Path to Inner Peace" },
  { id: "rSnrtdSB8RA", title: "The Essence of Seva" },
];

const YouTubeEmbed = ({
  videoId,
  className,
}: {
  videoId: string;
  className?: string;
}) => (
  <div
    className={`relative w-full overflow-hidden shadow-lg pt-[56.25%] ${className}`}
  >
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="absolute top-0 left-0 w-full h-full"
    ></iframe>
  </div>
);

export function SwamiSpeechSection() {
  return (
    <section className="bg-background overflow-hidden">
      {/* Top Section with Background Image */}
      <div className="relative">
        <div className="absolute inset-0 h-full w-full">
          <Image
            src="/vedio-imgsunilbhgat.png"
            alt="Spiritual gathering"
            fill
            className="object-cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        {/* This div is a spacer to create the height for the background image */}
        <div className="h-64 sm:h-80" />
      </div>

      {/* Content Section with Text and Videos */}
      <div className="container mx-auto px-4">
        {/* This div is pulled up with a negative margin to sit on the background image */}
        <div className="relative z-10 -mt-56 sm:-mt-64 pb-20 sm:pb-28">
          {/* Text */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-white leading-tight md:mb-3 lg:mb-4">
              Swami's Speech
            </h2>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto mb-3 md:mb-0">
              Listen to the enlightening words of Sunil Bhagat (Swami) as he
              shares timeless wisdom for a peaceful life.
            </p>
          </motion.div>

          {/* Main Video */}
          <motion.div
            className="max-w-2xl mx-auto sm:mt-12"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            <div className="p-2 bg-card rounded-[2.5rem] shadow-2xl">
              <YouTubeEmbed
                videoId={mainVideoId}
                className="rounded-[2rem]"
              />
            </div>
          </motion.div>

          {/* Other Videos */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.2 }}
          >
            {otherVideos.map((video, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.6, ease: easeOut },
                  },
                }}
              >
                <YouTubeEmbed videoId={video.id} className="rounded-lg" />
                <h3 className="mt-4 text-center text-lg font-serif font-semibold text-foreground">
                  {video.title}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}