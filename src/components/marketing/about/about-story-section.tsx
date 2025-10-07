"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function AboutStorySection() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mx-auto max-w-3xl text-center mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">
              Our Heritage
            </span>
            <h2 className="mt-4 text-4xl font-serif font-bold leading-tight text-foreground md:text-5xl">
              Our Sacred Story
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              A timeless sanctuary beside the Ganga, guided by compassion and
              dedicated to collective wellbeing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-10 md:gap-12 lg:grid-cols-2 lg:items-start">
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <figure className="flex h-full flex-col space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/70">
                  <Image
                    src="/sunilbhgat.png"
                    alt="Sunil Bhagat (Swami), spiritual guide of Sahajanand Wellness"
                    fill
                    sizes="(min-width: 1024px) 480px, 90vw"
                    quality={100}
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-sm text-muted-foreground/80">
                  Sunil Bhagat (Swami) welcoming seekers at the ashram
                  courtyard.
                </figcaption>
              </figure>
            </motion.div>


            {/* Right Side */}
            <motion.div
              className="order-1 flex h-full flex-col space-y-6 text-center text-lg text-muted-foreground lg:order-2 lg:text-left"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="space-y-5 text-base leading-relaxed md:text-lg">
                <p>
                  Nestled on the sacred banks of the Ganga in Rishikesh, the
                  <span className="mx-1 font-semibold text-foreground">
                    Shree Swaminarayan Ashram
                  </span>
                  has been a sanctuary for spiritual seekers since its
                  establishment in 1987. Founded by The SahajAnand Wellness
                  Trust, our ashram is built on the timeless principle of
                  “welfare for all.”
                </p>

                <p>
                  Guiding the ashram&apos;s spiritual journey is
                  <span className="mx-1 font-semibold text-foreground">
                    Sunil Bhagat,
                  </span>
                  affectionately known as Swami. His profound wisdom and
                  compassionate teachings inspire all who visit. Under his
                  guidance, the ashram continues to be a beacon of peace,
                  service, and spiritual growth.
                </p>

                <p>
                  At the heart of our mission are our core activities: the
                  Annakshetra, offering daily meals to all; the Gaushala, a
                  loving home for our sacred cows; and the Veda-Pathshala, which
                  preserves ancient Vedic wisdom. We welcome you to experience
                  the tranquility and spiritual nourishment that our ashram
                  offers.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="/gallery"
                  className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Discover our Gallery
                  <span className="ml-2">→</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
