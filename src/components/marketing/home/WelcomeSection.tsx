"use client";

import React from "react";
import Image from "next/image";
import { ActivityCard } from "@/components/marketing/home/ActivityCard";
import { motion, type Variants } from "framer-motion";

const activities = [
  {
    title: "Gaushala",
    description: "A sanctuary for cows, embodying selfless service.",
    imageUrl: "/about-goshala-2.jpg",
    href: "/about-us",
  },
  {
    title: "Veda-Pathshala",
    description: "Preserving ancient wisdom through Vedic education.",
    imageUrl: "/veda4.webp",
    href: "/about-us",
  },
  {
    title: "Annakshetra",
    description:
      "Serving humanity through daily, wholesome meals for all visitors and the local community.",
    imageUrl: "/annakshetra.png",
    href: "/about-us",
  },
  {
    title: "Ganga Aarti",
    description: "Experience the divine evening ceremony on our ghat.",
    imageUrl: "/ganga-arti.jpg",
    href: "/about-us",
  },
];

/**
 * Render the welcome section with a hero image and text, followed by an animated grid of activity cards.
 *
 * The component includes entrance animations for the hero image, text blocks, header, and each activity card using Framer Motion.
 *
 * @returns The React element containing the welcome hero and the "Our Sacred Activities" animated grid.
 */
export function WelcomeSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
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

  const imageVariants: Variants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

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

  return (
    <>
      <section className="bg-background py-10 sm:py-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ staggerChildren: 0.3 }}
          >
            {/* Image Column */}
            <motion.div
              variants={imageVariants}
              className="order-2 md:order-1"
            >
              <Image
                src="/rishikesh-temple.jpg"
                alt="Sahajanand Wellness Ashram in Rishikesh"
                width={600}
                height={400}
                className="rounded-2xl shadow-lg w-full h-auto object-cover"
              />
            </motion.div>
            {/* Text Column */}
            <motion.div
              variants={textVariants}
              className="order-1 md:order-2"
            >
              <div className="text-center md:text-left">
                <div className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                  <div className="flex items-center justify-center md:justify-start mb-2">
                    Welcome Home{" "}
                    <Image
                      src="/welcom-1.png"
                      alt="Sahajanand Wellness"
                      width={32}
                      height={32}
                      quality={100}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
                  Sahajanand Wellness: A Sacred Space for the Welfare of All
                </h2>
              </div>
              <div className="mt-6 space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed">
                <p>
                  Sahajanand Wellness is a true spiritual haven, lying on the
                  holy banks of Mother Ganga in the lap of the lush Himalayas.
                  It is one of the largest ashrams in Rishikesh, providing its
                  thousands of pilgrims who come from all corners of the Earth
                  with a clean, pure and sacred atmosphere as well as abundant,
                  beautiful gardens.
                </p>
                <p>
                  Embodying the principle of &lsquo;welfare for all,&rsquo; we welcome
                  seekers from every path to experience the profound peace and
                  spiritual nourishment offered here on the banks of the Ganga.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ashram Activities Section */}
      <section className="bg-gradient-to-b from-background to-secondary/60 py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex justify-center mb-2">
              <Image
                src="/swaminarayan-logo-1.png"
                alt="Sahajanand Wellness"
                width={40}
                height={40}
                quality={100}
                className="w-10 h-10 mt-10 object-contain"
              />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-2">
              Our Sacred Activities
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              At the heart of our ashram are activities dedicated to service,
              learning, and spiritual growth.
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {activities.map((activity) => (
              <motion.div key={activity.title} variants={itemVariants}>
                <ActivityCard
                  key={activity.title}
                  title={activity.title}
                  description={activity.description}
                  imageUrl={activity.imageUrl}
                  href={activity.href}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
