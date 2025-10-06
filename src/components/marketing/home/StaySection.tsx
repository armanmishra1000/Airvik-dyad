"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AccommodationCard } from "./AccommodationCard";
import { Leaf, BrainCircuit, HandHeart } from "lucide-react";
import { motion } from "framer-motion";

const accommodations = [
  {
    id: "Brahmbhoj",
    title: "Brahmbhoj [Semi Deluxe ] 2",
    description:
      "The ultimate sanctuary for peace and tranquility. A retreat space designed for deep spiritual renewal and inner healing. We must inform all the devotees that this is not a hotel but a dharmshala run by a religious trust for serving pilgrims and saints.",
    imageUrl: "/Dining Hall.png",
    tag: "souls of ancestors",
    Icon: Leaf,
    href: "/book",
  },
  {
    id: "AnnaDaan",
    title: "AnnaDaan [Premium Room ] 2",
    description:
      "A sacred space for deep meditation and inner contemplation. Simple furnishings create a serene environment for spiritual practice. Sunlight from the window and full ventilation help maintain a connection with the natural surroundings.",
    imageUrl: "/annakshetra.png",
    tag: "leaf or plate",
    Icon: BrainCircuit,
    href: "/book",
  },
  {
    id: "Havan",
    title: "Havan Donation [Economy Non AC ] only 2 person",
    description:
      "Designed for seekers engaged in selfless service. A peaceful sanctuary that balances rest with dedicated spiritual practice. Visitors are requested to help maintain the serenity of the ashram and participate in its sacred activities.",
    imageUrl: "/havan.png",
    tag: "neutralizing pollutants",
    Icon: HandHeart,
    href: "/book",
  },
  {
    id: "Ganga",
    title: "Ganga Aarti [Ganga Darshan ] 2/4",
    description:
      "Wake to the tranquil sounds and sacred sights of the holy river. These rooms offer a perfect vantage point for morning contemplation and experiencing the divine atmosphere of the Ganga, making for a truly memorable stay.",
    imageUrl: "/ganga-arti.jpg",
    tag: "River View",
    Icon: Leaf,
    href: "/book",
  },
];

/**
 * Render the "Stay" section with a header, an animated carousel of accommodation cards, and a reservation call-to-action.
 *
 * The section includes entrance animations, responsive layout, carousel navigation controls, and a primary button linking to the booking review page.
 *
 * @returns A JSX element representing the stay section containing the title/description, the accommodations carousel, and the reserve button.
 */
export function StaySection() {
  return (
    <section className="bg-background py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >


          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-4">
            Your Spiritual Sanctuary
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Find inner peace and transformation in our ashram setting. Designed
            for contemplation, spiritual growth around the divine energy of
            Rishikesh.
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
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-8">
              {accommodations.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="pl-8 md:basis-1/2 lg:basis-1/3"
                >
                  <AccommodationCard
                    title={item.title}
                    description={item.description}
                    imageUrl={item.imageUrl}
                    tag={item.tag}
                    Icon={item.Icon}
                    href={item.href}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-[112px] -translate-y-1/2 -translate-x-1/2 rounded-full h-10 w-10 lg:h-12 lg:w-12 bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground z-10" />
            <CarouselNext className="absolute right-0 top-[112px] -translate-y-1/2 translate-x-1/2 rounded-full h-10 w-10 lg:h-12 lg:w-12 bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground z-10" />
          </Carousel>
        </motion.div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary-hover px-8 py-6 text-base rounded-md"
          >
            <Link href="/book/review">Reserve Your Sacred Stay</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}