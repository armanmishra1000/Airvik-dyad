"use client";

import Image from "next/image";
import { PublicHeader } from "@/components/public/header";
import { FeatureCard } from "@/components/feature-card";
import { WelcomeSection } from "@/components/welcome-section";
import { VideoSection } from "@/components/video-section";
import { StaySection } from "@/components/stay-section";
import { PublicFooter } from "@/components/public/footer";
import { TestimonialSection } from "@/components/testimonial-section";
import { GallerySection } from "@/components/gallery-section";
import { Marquee } from "@/components/marquee";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Annakshetra",
      description:
        "Serving humanity through daily, wholesome meals for all visitors and the local community.",
      imageUrl: "/annakshetra.png",
      highlighted: false,
    },
    {
      title: "Ashram Stay",
      description:
        "Experience tranquility and spiritual rejuvenation by booking a stay in our serene ashram rooms.",
      imageUrl: "/sahaj-home.png",
      highlighted: true,
      href: "/rooms",
    },
    {
      title: "Yoga & Meditation",
      description:
        "Harmonize your mind, body, and soul with our daily yoga and guided meditation sessions.",
      imageUrl: "/yoga.png",
      highlighted: false,
    },
  ];

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
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] min-h-[500px]">
          <Image
            src="/hero-background.png"
            alt="Rishikesh temple by the Ganges"
            fill
            style={{ objectFit: "cover" }}
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
            <motion.div
              className="max-w-4xl"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div
                variants={itemVariants}
                className="flex justify-center mb-2"
              >
                <Image
                  src="/Swami-narayan.png"
                  alt="Sahajanand Wellness"
                  width={128}
                  height={128}
                  quality={100}
                  className="w-24 h-24 sm:w-32 sm:h-32 mt-4 sm:mt-10 object-contain"
                ></Image>
              </motion.div>
              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-md font-semibold tracking-widest text-primary-foreground/80 mb-2 sm:mb-4 uppercase"
              >
                YOUR SANCTUARY AWAITS
              </motion.p>
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif leading-tight"
              >
                Sahajanand Wellness
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-4 text-base sm:text-lg font-medium tracking-wider text-primary-foreground/90 uppercase"
              >
                WELLNESS - THE BEST GIFT TO YOURSELF
              </motion.p>
              
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative lg:-mt-24 pb-20">
          <div className="container mx-auto px-4 pt-20 lg:pt-12">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
            >
              {features.map((feature: any) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    imageUrl={feature.imageUrl}
                    highlighted={feature.highlighted}
                    href={feature.href}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Welcome Section */}
        <WelcomeSection />

        {/* Gallery Section */}
        <GallerySection />

        {/* Video Section */}
        <VideoSection />

        {/* Stay Section */}
        <StaySection />

        {/* Testimonial Section */}
        <TestimonialSection />
        <Marquee />
      </main>
    </div>
  );
}
