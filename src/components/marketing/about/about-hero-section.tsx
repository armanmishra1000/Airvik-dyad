import Image from "next/image";

/**
 * Displays a responsive hero section with a full-bleed background image and a semi-transparent black overlay.
 *
 * @returns A JSX element representing the hero section containing the background image and overlay.
 */
export function AboutHeroSection() {
  return (
    <section className="relative w-full h-[200px] sm:h-[300px]">
      <Image
        src="/rishikesh-ahsram.png"
        alt="Sahajanand Wellness Ashram in Rishikesh"
        fill
        style={{ objectFit: "cover" }}
        quality={100}
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
    </section>
  );
}