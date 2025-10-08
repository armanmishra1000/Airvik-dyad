"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Flower2,
  UtensilsCrossed,
  Sparkles,
  Waves,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type HighlightStat = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const highlightStats: HighlightStat[] = [
  {
    title: "Holistic wellbeing",
    description: "Curated spaces designed to harmonise mind, body, and spirit.",
    icon: Flower2,
  },
  {
    title: "Sattvic nourishment",
    description: "Freshly prepared meals served in Annakshetra three times daily.",
    icon: UtensilsCrossed,
  },
  {
    title: "Immersive serenity",
    description: "River-facing meditation decks and verdant courtyards to unwind.",
    icon: Waves,
  },
  {
    title: "Guided experiences",
    description: "Daily rituals, yogic sessions, and cultural immersions to deepen your stay.",
    icon: Sparkles,
  },
];

export function AmenitiesHeroSection() {
  const textVariants: Variants = {
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const statsContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const statItemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[620px] lg:min-h-[680px]">
      <div className="absolute inset-0">
        <Image
          src="/amenities-hero-banner.webp"
          alt="Sahajanand Wellness overlooking the Ganges"
          fill
          quality={100}
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br backdrop-blur-[2px] from-black/40 via-black/60 to-black/20" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-10 lg:py-16 text-white">
          <motion.div
            className="max-w-3xl space-y-6"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Where every detail is curated for profound tranquillity
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80">
              Discover thoughtfully designed spaces that honour centuries-old wisdom while embracing modern comfort. Each amenity is lovingly crafted to elevate your journey of rest, reflection, and renewal.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
              <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
                <Link href="/book">Plan your stay</Link>
              </Button>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <ShieldCheck className="h-5 w-5" />
                <span>Personalised assistance from arrival to departure</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:mt-16 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={statsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {highlightStats.map(({ title, description, icon: Icon }) => (
              <motion.div
                key={title}
                variants={statItemVariants}
                className="border border-white/10 bg-white/10 backdrop-blur rounded-3xl p-6 flex flex-col gap-4 shadow-lg shadow-black/10"
              >
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
