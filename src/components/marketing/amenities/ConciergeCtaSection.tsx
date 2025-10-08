"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ConciergeCtaSection() {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden py-10 md:py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 -z-10" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl border border-primary/20 bg-background/90 backdrop-blur-xl p-6 sm:p-12 lg:p-16 shadow-lg shadow-primary/10 flex flex-col lg:flex-row items-start lg:items-center gap-10"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
            <motion.div
              className="flex-1 space-y-4"
              variants={contentVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
            >
              <motion.h2
                variants={itemVariants}
                className="text-2xl sm:text-4xl leading-tight max-w-4xl"
              >
                Reserve your stay and let our concierge personalise every moment
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-muted-foreground max-w-3xl"
              >
                Share your intentions with us whether it&apos;s detox, devotion,
                or discovery and we will lovingly orchestrate the amenities,
                rituals, and experiences around you.
              </motion.p>
            </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.div variants={itemVariants}>
              <Button
                asChild
                size="lg"
                className="h-12 px-8 w-full text-base font-semibold"
              >
                <Link href="/book">Book accommodation</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
