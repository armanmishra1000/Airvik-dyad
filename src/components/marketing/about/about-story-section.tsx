"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function AboutStorySection() {
  return (
    <section className="py-10 lg:py-28 md:py-18">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-6 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex justify-center">
            <Image
              src="/swaminarayan-logo-1.png"
              alt="swami-img"
              width={20}
              height={20}
              quality={100}
              className=""
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
            Our Sacred Story
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image Column */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src="/sunilbhgat.png"
              alt="Sunil Bhagat (Swami), spiritual guide of Sahajanand Wellness"
              width={500}
              height={600}
              quality={100}
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </motion.div>

          {/* Content Column */}
          <motion.div
            className="order-1 lg:order-2 space-y-6 text-lg text-muted-foreground text-center lg:text-left"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p>
              Nestled on the sacred banks of the Ganga in Rishikesh, the{" "}
              <span className="font-semibold text-foreground">
                Shree Swaminarayan Ashram
              </span>{" "}
              has been a sanctuary for spiritual seekers since its
              establishment in 1987. Founded by{" "}
              <span className="font-semibold text-foreground">
                The SahajAnand Wellness Trust
              </span>
              , our ashram is built on the timeless principle of &ldquo;welfare for
              all.&rdquo;
            </p>
            <p>
              Guiding the ashram&apos;s spiritual journey is{" "}
              <span className="font-semibold text-foreground">
                Sunil Bhagat
              </span>
              , affectionately known as Swami. His profound wisdom and
              compassionate teachings inspire all who visit. Under his
              guidance, the ashram continues to be a beacon of peace, service,
              and spiritual growth.
            </p>
            <p>
              At the heart of our mission are our core activities: the
              Annakshetra, offering daily meals to all; the Gaushala, a loving
              home for our sacred cows; and the Veda-Pathshala, which preserves
              ancient Vedic wisdom. We welcome you to experience the
              tranquility and spiritual nourishment that our ashram offers.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}