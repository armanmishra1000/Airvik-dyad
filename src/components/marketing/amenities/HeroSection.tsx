"use client";

import Image from "next/image";

/**
 * Renders the amenities hero section with a full-bleed background image, headline, call-to-action, and an animated grid of highlight stats.
 *
 * @returns A JSX element containing the hero layout, overlay, CTA linking to /book, and animated statistic cards
 */
export function AmenitiesHeroSection() {
  return (
    <section className="relative overflow-hidden bg-muted">
      <div className="absolute inset-0">
        <Image
          src="/shajanad.png"
          alt="Handpicked pieces for mindful living"
          fill
          priority
          quality={100}
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-24 text-center text-white md:px-6 md:py-32">
          <h1 className="text-3xl sm:text-4xl font-semibold lg:text-5xl">
            Peaceful Comforts
          </h1>
          <p className="text-base text-white/80 md:text-lg max-w-3xl">
            Find peace and comfort in our sacred spaces and mindful facilities.
          </p>
        </div>
      </div>
    </section>
  );
}