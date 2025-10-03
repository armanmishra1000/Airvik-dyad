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
      {/* <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif leading-tight">
          About Rishikesh
        </h1>
        <p className="mt-4 text-lg sm:text-xl max-w-3xl">
          The Yoga Capital of the World
        </p>
      </div> */}
    </section>
  );
}