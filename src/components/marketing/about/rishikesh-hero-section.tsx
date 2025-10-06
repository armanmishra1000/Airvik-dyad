import Image from "next/image";

export function RishikeshHeroSection() {
  return (
    <section className="relative w-full h-[200px] sm:h-[300px]">
      <Image
        src="/Interesting-Facts-About-Rishikesh.webp"
        alt="Scenic view of Rishikesh with the Ganga river and mountains"
        fill
        style={{ objectFit: "cover" }}
        quality={100}
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
    </section>
  );
}