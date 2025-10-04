"use client";

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { motion, easeOut } from "framer-motion";

const testimonials = [
  {
    quote:
      "Here, amidst the gentle whispers of the Ganga, I found a silence that spoke volumes to my soul. It's not just a place; it's a state of being.",
    author: "A Seeker from Abroad",
  },
  {
    quote:
      "The morning aarti filled my heart with a devotion I had only read about. Sahajanand Wellness is a true sanctuary for anyone on a spiritual path.",
    author: "A Pilgrim from India",
  },
  {
    quote:
      "Serving in the Annakshetra was the most profound form of meditation. To give without expectation is a lesson I will carry with me forever.",
    author: "A Volunteer",
  },
  {
    quote:
      "The teachings at the Veda-Pathshala are a beacon of ancient wisdom in the modern world. I feel blessed to have witnessed this sacred tradition.",
    author: "A Visiting Scholar",
  },
];

export function TestimonialSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="bg-background sm:pt-28 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-4">
            Echoes of Peace
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Heartfelt reflections from those who have experienced the serenity
            of our ashram.
          </p>
        </motion.div>

        <motion.div
          className="relative w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: easeOut }}
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
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2">
                  <div className="p-4 h-full">
                    <Card className="bg-card h-full flex flex-col justify-center shadow-md border-l-4 border-primary">
                      <CardContent className="p-8 text-center space-y-6">
                        {/* <Quote className="h-8 w-8 text-primary/50 mx-auto" /> */}
                        <p className="text-lg font-serif italic text-foreground/80">
                          "{testimonial.quote}"
                        </p>
                        {/* <p className="font-semibold text-muted-foreground text-sm tracking-wider uppercase">
                          - {testimonial.author}
                        </p> */}
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}