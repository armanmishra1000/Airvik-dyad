"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { FeatureCard } from "@/components/marketing/home/FeatureCard";
import { WelcomeSection } from "@/components/marketing/home/WelcomeSection";
import { VideoSection } from "@/components/marketing/home/VideoSection";
import { StaySection } from "@/components/marketing/home/StaySection";
import { TestimonialSection } from "@/components/marketing/home/TestimonialSection";
import { GallerySection } from "@/components/marketing/home/GallerySection";
import { Marquee } from "@/components/marketing/layout/Marquee";

type Feature = {
  title: string;
  description: string;
  imageUrl: string;
  highlighted: boolean;
  href?: string;
};

const features: Feature[] = [
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
    href: "/booking",
  },
  {
    title: "Yoga & Meditation",
    description:
      "Harmonize your mind, body, and soul with our daily yoga and guided meditation sessions.",
    imageUrl: "/yoga.png",
    highlighted: false,
  },
];

/**
 * Root page component that renders the Sahajanand Wellness home page layout.
 *
 * Renders the hero banner with background image and animated title, a features grid
 * with staggered entrance animations, and the site sections: Welcome, Gallery,
 * Video, Stay, Testimonial, and Marquee.
 *
 * @returns The JSX element representing the complete home page.
 */
export default function HomePage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
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

  const newLocal = "relative mb-10 md:mb-20";
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[450px]">
        <Image
          src="/home-img.png"
          alt="Rishikesh temple by the Ganges"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-start h-full text-center text-white">
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
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
              />
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
      <section className={newLocal}>
        <div className="container mx-auto px-4 -mt-20">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  imageUrl={feature.imageUrl}
                  highlighted={feature.highlighted}
                  href={feature.href}
                  className={`h-full ${feature.highlighted ? "" : "md:h-[360px]"}`}
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
    </div>
  );
}