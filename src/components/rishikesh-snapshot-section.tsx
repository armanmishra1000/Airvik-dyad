"use client";

import { motion } from "framer-motion";
import { SnapshotCard } from "./snapshot-card";
import { Flame, Mountain, Landmark } from "lucide-react";

const snapshots = [
  {
    title: "Spirituality",
    description: "Daily rituals, meditations, and Ashrams along the Ganga.",
    imageUrl: "/ganga-arti.jpg",
    Icon: Flame,
  },
  {
    title: "Adventure",
    description: "Rafting, trekking, and Himalayan escapes for all levels.",
    imageUrl: "/Rishikesh-rafting.jpg",
    Icon: Mountain,
  },
  {
    title: "Culture",
    description: "Temples, traditions, and vibrant festivals of Rishikesh.",
    imageUrl: "/parmarth-niketan.jpg",
    Icon: Landmark,
  },
];

export function RishikeshSnapshotSection() {
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
    <section className="bg-muted/50 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
            Rishikesh Snapshot
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {snapshots.map((snapshot) => (
            <motion.div key={snapshot.title} variants={itemVariants}>
              <SnapshotCard
                title={snapshot.title}
                description={snapshot.description}
                imageUrl={snapshot.imageUrl}
                Icon={snapshot.Icon}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}