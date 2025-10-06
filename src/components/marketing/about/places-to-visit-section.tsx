"use client";

import React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

const placesToVisit = [
  {
    title: "Triveni Ghat",
    imageUrl: "/triveni-ghat-rishikesh-uttarakhand.jpg",
    description:
      "The biggest and most famous ghat in Rishikesh, known for its evening Ganga Aarti.",
  },
  {
    title: "Ganga Aarti",
    imageUrl: "/rishikesh-ganga-aarti-.png",
    description:
      "A mesmerizing ritual of worship with lamps, chants, and prayers on the banks of the Ganga.",
  },
  {
    title: "Lakshman Jhula | Ram Jhula",
    imageUrl: "/ram-lkshmanjula.webp",
    description:
      "Iconic suspension bridges offering stunning views of the river and surrounding temples.",
  },
  {
    title: "Rafting in Rishikesh",
    imageUrl: "/Rishikesh-rafting.jpg",
    description:
      "Experience the thrill of white-water rafting on the holy Ganges river.",
  },
  {
    title: "Bungee Jumping",
    imageUrl: "/bungee.webp",
    description:
      "Rishikesh is also known for its bungee jumping facility, which provides an adrenaline-pumping experience as you leap from a height and feel the rush of free fall.",
  },
  {
    title: "Gathering at the Ghat",
    imageUrl: "/gatherning-ghat.png",
    description:
      "Join pilgrims and locals for a spiritual gathering at the ghats during sunrise and sunset.",
  },
  {
    title: "Mountain Escape",
    imageUrl: "/Mountain Escape.jpg",
    description:
      "Explore the serene Himalayan foothills with treks to waterfalls and stunning viewpoints.",
  },
];

const FlippableCard = ({ place }: { place: (typeof placesToVisit)[0] }) => {
  return (
    <div className="group h-80 w-full [perspective:1000px]">
      <div className="relative h-full w-full rounded-lg shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front Face */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Image
            src={place.imageUrl}
            alt={place.title}
            fill
            className="object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-2xl font-serif font-bold text-white">
              {place.title}
            </h3>
          </div>
        </div>
        {/* Back Face */}
        <div className="absolute inset-0 h-full w-full rounded-lg bg-card text-center text-foreground [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex min-h-full flex-col items-center justify-center p-6">
            <h3 className="text-2xl font-serif font-bold">{place.title}</h3>
            <p className="mt-2 text-base text-muted-foreground">
              {place.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Render a responsive "Explore the Wonders of Rishikesh" section with an autoplaying carousel of flippable place cards.
 *
 * The section includes an animated header, a looping carousel that advances every 3000ms (pauses on interaction), and previous/next controls. Each carousel item is a flippable card that shows an image and title on the front and a description on the back.
 *
 * @returns A React element containing the carousel section populated from the local places data.
 */
export function PlacesToVisitSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <section className="bg-background py-16 lg:py-28 md:py-15">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-4">
            Explore the Wonders of Rishikesh
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the spiritual and natural attractions that make Rishikesh a
            world-renowned destination.
          </p>
        </motion.div>

        <motion.div
          className="relative w-full max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Carousel
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="-ml-8">
              {placesToVisit.map((place, index) => (
                <CarouselItem
                  key={index}
                  className="pl-8 md:basis-1/2 lg:basis-1/3"
                >
                  <FlippableCard place={place} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full h-10 w-10 lg:h-12 lg:w-12 bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground z-10" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full h-10 w-10 lg:h-12 lg:w-12 bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground z-10" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}