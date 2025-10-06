"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Renders a responsive section containing an animated heading and an embedded Google Map showing SahajAnand Wellness in Rishikesh.
 *
 * @returns The JSX element for the map section, including the animated header and the iframe map.
 */
export function MapSection() {
  return (
    <section className="bg-background py-10 lg:py-28 md:py-18">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
            Find Us in Rishikesh SahajAnand Wellness
          </h2>
        </motion.div>
        <motion.div
          className="overflow-hidden rounded-lg shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2902.272884338711!2d78.30549412337857!3d30.11126357904903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3909176c900772f7%3A0x4a96d2800fe36395!2sSahajanand%20Wellness!5e0!3m2!1sen!2sin!4v1759462872633!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[450px]"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}