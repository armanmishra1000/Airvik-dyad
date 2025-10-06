"use client";

import { motion } from "framer-motion";

/**
 * Render a responsive section describing Swami's charitable work with a fade-and-slide animation when it enters the viewport.
 *
 * @returns A JSX element containing a titled content block and three descriptive paragraphs, wrapped in a motion-enabled container for in-view animation.
 */
export function SunilBhagatWorkSection() {
  return (
    <section className="mb-6 lg:mb-20 md:mb-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-8">
            Swami&apos;s Work: A Legacy of Compassion
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Swami&apos;s work extends far beyond spiritual discourses, embodying
              the principle of &apos;welfare for all&apos; in every action. He is the
              guiding force behind the ashram&apos;s extensive charitable
              activities, ensuring that compassion and service are at the heart
              of our community.
            </p>
            <p>
              He personally oversees the daily operations of the Annakshetra, a
              sacred kitchen that provides thousands of free, nourishing meals
              to pilgrims, saints, and those in need. His deep respect for all
              life is also reflected in his dedicated care for the Gaushala, a
              sanctuary where sacred cows are honored and protected.
            </p>
            <p>
              Through his tireless efforts, Swami has cultivated a profound
              environment of selfless service (seva). He inspires visitors and
              residents alike to participate in the ashram&apos;s mission, creating a
              sanctuary where individuals can deepen their spiritual practice
              while making a positive impact on the world.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}