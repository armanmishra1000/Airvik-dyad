"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type VideoItem = {
  url: string;
  title: string;
};

const videos: VideoItem[] = [
  {
    url: "https://www.youtube.com/watch?v=mo71k6k5E-k&t=86s",
    title: "Divine Ganga Aarti – Rishikesh Dham",
  },
  {
    url: "https://www.youtube.com/watch?v=V2CrSWlqkgA",
    title: "Ashram Visual Tour",
  },
];

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

function toEmbedUrl(input: string) {
  try {
    const url = new URL(input);
    const params = new URLSearchParams();
    const addStart = (t?: string | null) => {
      if (!t) return;
      const hms = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;
      let seconds = 0;
      if (/^\d+$/.test(t)) seconds = parseInt(t, 10);
      else {
        const m = t.match(hms);
        if (m) seconds = (parseInt(m[1] || "0") * 3600) + (parseInt(m[2] || "0") * 60) + parseInt(m[3] || "0");
      }
      if (seconds > 0) params.set("start", String(seconds));
    };

    let id = "";
    if (url.hostname.includes("youtu.be")) {
      id = url.pathname.split("/").filter(Boolean)[0] || "";
      addStart(url.searchParams.get("t") || url.searchParams.get("start"));
    } else if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/watch")) {
        id = url.searchParams.get("v") || "";
        addStart(url.searchParams.get("t") || url.searchParams.get("start"));
      } else if (url.pathname.startsWith("/shorts/")) {
        id = url.pathname.split("/")[2] || "";
        addStart(url.searchParams.get("t") || url.searchParams.get("start"));
      } else if (url.pathname.startsWith("/embed/")) {
        id = url.pathname.split("/")[2] || "";
        addStart(url.searchParams.get("start") || url.searchParams.get("t"));
      }
    }

    if (!id) return input;
    params.set("modestbranding", "1");
    params.set("rel", "0");
    params.set("playsinline", "1");
    params.set("autoplay", "1");
    params.set("mute", "1");
    const qs = params.toString();
    return `https://www.youtube.com/embed/${id}${qs ? `?${qs}` : ""}`;
  } catch {
    return input;
  }
}

function VideoCard({ video }: { video: VideoItem }) {
  return (
    <motion.div variants={itemVariants} className="flex w-full flex-col items-center">
      <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-lg shadow-primary/5">
        <div className="relative aspect-video">
          <iframe
            src={toEmbedUrl(video.url)}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
      <div className="w-full -mt-4 px-5">
        <div className="mx-auto rounded-2xl border border-border/40 bg-primary/15 px-6 lg:py-3 py-2 text-center">
          <h4 className="text-sm lg:text-xl mt-3 font-semibold text-primary">{video.title}</h4>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Renders the "Visual Journey" section with a centered header and an animated responsive grid of videos.
 *
 * The grid contains two embedded YouTube videos that play muted and loop by default, each displaying a bottom title overlay.
 *
 * @returns The JSX section element containing the header and the animated video grid
 */
export function VideoSection() {
  return (
    <section className="to-secondary/20 py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center justify-center">
            <h3 className="mr-4 text-4xl font-bold text-foreground md:text-5xl">
              Visual Journey
            </h3>
            <Image
              src="/swami-img-removebg-preview.png"
              alt="Meditation symbol"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Immerse yourself in the sights and sounds of Sahajanand Wellness,
            from the tranquil banks of the Ganga to the vibrant evening Aarti.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {videos.map((video, idx) => (
            <VideoCard key={idx} video={video} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
