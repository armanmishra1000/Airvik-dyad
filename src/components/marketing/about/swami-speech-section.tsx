"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";

const mainVideoId = "rSnrtdSB8RA";
const otherVideos = [
  { id: "RHaosnSo70k", title: "Discourse on Dharma" },
  { id: "VcXQFtzjXJI", title: "Path to Inner Peace" },
  { id: "rSnrtdSB8RA", title: "The Essence of Seva" },
];

const YouTubeEmbed = ({
  videoId,
  className = "",
}: {
  videoId: string;
  className?: string;
}) => (
  <div className={`aspect-video w-full ${className}`.trim()}>
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="w-full h-full"
    ></iframe>
  </div>
);

export function SwamiSpeechSection() {
  return (
    <section className="bg-background py-10 sm:py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <div>
          {/* Daily Ganga Aarti Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
              {/* Left Side - Content */}
              <div className="space-y-4 order-1">
                <div className="space-y-3">
                  {/* Eyebrow */}
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                    Spiritual Teachings
                  </p>
                  <h2 className="2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground">
                    Swamiji&apos;s Teachings & the Daily Ganga Aarti
                  </h2>
                  <p className="text-base text-muted-foreground md:text-lg">
                    Explore the enlightening discourses of Swamiji Sunil Bhagat and join the evening Ganga Aarti, a living Vedic ritual of light, chant and collective prayer that he leads with devotees and visitors at sunset on the ghats. Recordings and livestreams of the ceremony are available on the RishikeshDham YouTube channel.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium">Daily at sunset (6:00–7:00 PM)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium">Shree Swaminarayan Ganga Aarti Ghat, Rishikesh</span>
                  </div>
                </div>

                <div>
                  <Link
                    href="https://www.youtube.com/@rishikeshdham"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-primary hover:underline underline-offset-4 focus-visible:outline-none"
                  >
                    Watch the Daily Ganga Aarti →
                  </Link>
                </div>
              </div>

              {/* Right Side - Video */}
              <div className="order-2">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-border h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px]">
                  <YouTubeEmbed
                    videoId={mainVideoId}
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* More Teachings Grid */}
          <div className="mt-12">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-foreground mb-6"
            >
              More Teachings
            </motion.h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherVideos.map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <YouTubeEmbed videoId={video.id} className="rounded-t-xl" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-base font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                      {video.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}