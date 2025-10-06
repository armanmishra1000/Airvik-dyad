"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function RishikeshStorySection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = (direction: "left" | "right") => ({
    hidden: { opacity: 0, x: direction === "left" ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  });

  return (
    <section className="py-10 lg:py-28 md:py-18 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-6 lg:mb-16 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
            A Land of Sages and Seekers
          </h2>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* Image Column */}
          <motion.div
            variants={itemVariants("left")}
            className="order-2 lg:order-1"
          >
            <Image
              src="/rishikesh-1.png"
              alt="A panoramic view of the Ganga river flowing through Rishikesh"
              width={600}
              height={450}
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </motion.div>
          {/* Text Column */}
          <motion.div
            variants={itemVariants("right")}
            className="space-y-6 text-lg text-muted-foreground text-center lg:text-left order-1 lg:order-2"
          >
            <p>
              Rishikesh, known as the &apos;Gateway to the Garhwal Himalayas&apos; and
              the &apos;Yoga Capital of the World,&apos; is a town of profound
              spiritual significance. Nestled in the foothills of the
              Himalayas in northern India, it is a place where the sacred
              river Ganga flows, purifying all who come to its banks.
            </p>
            <p>
              For centuries, Rishikesh has been a magnet for saints, sages,
              and spiritual seekers from around the globe. The town is
              dotted with temples, ashrams, and yoga centers, creating an
              atmosphere charged with divine energy. The iconic Laxman Jhula
              and Ram Jhula suspension bridges span the vibrant Ganga,
              leading to bustling markets and serene ashram paths.
            </p>
            <p>
              Whether you are here for adventure, spiritual solace, or to
              deepen your yoga practice, Rishikesh offers a transformative
              experience that resonates deep within the soul.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}