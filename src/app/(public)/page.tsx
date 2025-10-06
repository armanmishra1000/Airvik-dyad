"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/marketing/home/FeatureCard";
import { WelcomeSection } from "@/components/marketing/home/WelcomeSection";
import { VideoSection } from "@/components/marketing/home/VideoSection";
import { StaySection } from "@/components/marketing/home/StaySection";
import { TestimonialSection } from "@/components/marketing/home/TestimonialSection";
import { GallerySection } from "@/components/marketing/home/GallerySection";
import { OurRoomsSection } from "@/components/marketing/home/OurRoomsSection";
import { Marquee } from "@/components/marketing/layout/Marquee";
import { Calendar } from "lucide-react";

const features = [
  {
    title: "Annakshetra",
    description:
      "Experience divine community kitchen serving free meals to all visitors",
    imageUrl: "/annakshetra.png",
    highlighted: false,
    href: "/about-us",
  },
  {
    title: "Ashram Stay",
    description:
      "Peaceful accommodation amidst spiritual surroundings in Rishikesh",
    imageUrl: "/ashram-stay.png",
    highlighted: true,
    href: "/book",
  },
  {
    title: "Yoga & Meditation",
    description:
      "Daily yoga sessions and meditation programs for inner peace",
    imageUrl: "/yoga-meditation.jpg",
    highlighted: false,
    href: "/about-us",
  },
];

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/ganga-rishikesh.jpg"
            alt="Sahajanand Ashram Rishikesh"
            fill
            className="object-cover"
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex justify-center">
              <Image
                src="/swaminarayan-logo-1.png"
                alt="Sahajanand Wellness"
                width={96}
                height={96}
                quality={100}
                className="w-24 h-24 sm:w-32 sm:h-32 mt-4 sm:mt-10 object-contain"
              />
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="text-sm sm:text-md font-semibold tracking-widest text-primary-foreground/80 mb-2 sm:mb-4 uppercase"
            >
              YOUR SANCTUARY AWAITS
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif leading-tight"
            >
              Sahajanand Wellness
            </motion.h1>
            <motion.div
              variants={itemVariants}
              className="mt-4 text-base sm:text-lg font-medium tracking-wider text-primary-foreground/90 uppercase"
            >
              WELLNESS - THE BEST GIFT TO YOURSELF
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="bg-primary hover:bg-primary-hover">
                <Link href="/book/review">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Stay
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative lg:-mt-24 pb-20">
        <div className="container mx-auto px-4 pt-20 lg:pt-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <WelcomeSection />
      <VideoSection />
      <StaySection />
      <OurRoomsSection />
      <TestimonialSection />
      <GallerySection />

      <Marquee />
    </div>
  );
}