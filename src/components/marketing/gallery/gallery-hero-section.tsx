import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Renders the gallery hero section with a full-bleed background image, semi-transparent overlay, and animated centered heading and subtitle.
 *
 * @returns The JSX element for the gallery hero section.
 */
export function GalleryHeroSection() {
  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
      <Image
        src="/gallery.png"
        alt="Gallery of Sahajanand Wellness"
        fill
        className="object-cover"
        quality={100}
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight">
            Our Gallery
          </h1>
          <p className="mt-4 text-lg sm:text-xl max-w-3xl text-white/90">
            A glimpse into the serene life at Sahajanand Wellness
          </p>
        </motion.div>
      </div>
    </section>
  );
}