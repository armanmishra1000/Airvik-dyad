"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

export function AboutHeroSection() {
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
    }
  };

  return (
    <section className="bg-background py-10 sm:py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ staggerChildren: 0.3 }}
        >
          {/* Left Column: Main Content */}
          <motion.div
            variants={contentVariants}
            className="space-y-4 order-2 lg:order-1"
          >
            {/* Eyebrow */}
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              About Sahajanand Wellness
            </p>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
              Rooted Guidance for Modern Seekers
            </h1>

            {/* Body Copy */}
            <p className="text-base text-muted-foreground md:text-lg">
              For decades we've welcomed seekers to a quiet riverside refuge, balancing Vedic wisdom with practical routines. Join us for mindful stays, honest dialog, and rituals that keep you connected to purpose.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button asChild size="lg">
                <Link href="#our-story">Explore Our Story</Link>
              </Button>
              <Link
                href="/sunil-bhagat"
                className="text-base font-medium text-primary hover:underline underline-offset-4 focus-visible:outline-none"
              >
                Meet Our Guide →
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Image */}
          <motion.div
            variants={imageVariants}
            className="relative order-1 lg:order-2"
          >
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/rishikesh-ahsram.png"
                alt="Sahajanand Wellness Ashram"
                width={600}
                height={400}
                className="object-cover aspect-[3/2] rounded-2xl w-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
