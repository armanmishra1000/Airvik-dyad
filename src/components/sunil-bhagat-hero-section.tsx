import Image from "next/image";

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