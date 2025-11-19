"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function JourneyCTA() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center space-y-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif">
            Become Part of Our Journey
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
            Experience the peace and spirituality that has touched thousands of lives over the decades. 
            Join us for a transformative stay at Sahajanand Ashram.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8"
            >
              <Link href="/book" className="flex items-center gap-2">
                Book Your Stay
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary font-semibold px-8"
            >
              <Link href="/about-us">
                Learn More
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
