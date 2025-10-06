import Image from "next/image";

/**
 * Renders a full-width hero section showing a background image of Sunil Bhagat with a semi-transparent black overlay.
 *
 * @returns A React element containing the image-filled hero section with an overlay.
 */
export function SunilBhagatHeroSection() {
  return (
    <section className="relative w-full h-[200px] sm:h-[300px]">
      <Image
        src="/ganga-1.jpg"
        alt="Sunil Bhagat (Swami), spiritual guide of Sahajanand Wellness"
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
        quality={100}
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
    </section>
  );
}