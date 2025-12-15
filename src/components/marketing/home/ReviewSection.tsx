"use client";

import Image from "next/image";
import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

type CarouselReview = {
  quote: string;
  image: string;
  imageAlt: string;
  reviewerName?: string;
  reviewerTitle?: string;
};

type ReviewsResponse = {
  data?: Array<{
    reviewerName: string;
    reviewerTitle?: string;
    content: string;
    imageUrl: string;
  }>;
};

const fallbackReviews: CarouselReview[] = [
  {
    quote:
      "Sahajanand Wellness provided me with an incredible space to reconnect with myself",
    image: "/user-2.png",
    imageAlt: "Guest meditating in harmony",
  },
  {
    quote:
      "We all enjoyed a lot, very good property, location, hospitality... try to come back soon.",
    image: "/tS-2.jpg",
    imageAlt: "Guest expressing gratitude",
  },
  {
    quote:
      "A very nice place to stay in Rishikesh... a very nice place to stay in the natural beauty next to Gangaji.",
    image: "/user-1.png",
    imageAlt: "Guest radiating joy",
  },
  {
    quote:
      "The retreats at Sahajanand helped me find inner peace and true relaxation",
    image: "/t-4.webp",
    imageAlt: "Guest experiencing serenity",
  },
];

const reviewCardBackground = "rgba(255, 248, 243, 0.85)";

const renderQuote = (quote: string) => quote;

export function ReviewSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false })
  );
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [reviews, setReviews] = React.useState<CarouselReview[]>(
    fallbackReviews
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        const response = await fetch("/api/reviews", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const json: ReviewsResponse = await response.json();
        if (!json?.data?.length || cancelled) {
          return;
        }
        const mapped: CarouselReview[] = json.data.map((review) => ({
          quote: review.content,
          image: review.imageUrl,
          imageAlt: review.reviewerName,
          reviewerName: review.reviewerName,
          reviewerTitle: review.reviewerTitle,
        }));
        setReviews(mapped);
      } catch (error) {
        console.error("Failed to load reviews", error);
      }
    };

    void loadReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-background py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-6 lg:mb-12 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground">
            Stories of Stillness
          </h2>
          <p className="text-base text-muted-foreground md:text-lg max-w-3xl mx-auto">
            Heartfelt reflections from those who have experienced the serenity
            of our ashram.
          </p>
        </motion.div>

        <motion.div
          className="relative w-full"
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
            setApi={setApi}
          >
            <CarouselContent className="cursor-pointer select-none">
              {reviews.map((review, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-12 h-full">
                    <Card
                      className="relative h-full rounded-3xl border border-white/80"
                      style={{ backgroundColor: reviewCardBackground }}
                    >
                      <CardContent className="relative flex h-full flex-col items-center gap-6 px-8 pt-20 pb-6 text-center sm:pt-24 md:pt-24 md:pb-8 lg:px-10 lg:pt-28 select-none">
                        <div className="flex items-center justify-center -mt-16">
                          <div className="absolute -top-12 sm:-top-10 lg:-top-16 left-1/2 -translate-x-1/2 flex h-24 w-24 lg:w-32 lg:h-32 items-center justify-center rounded-full border-4 border-white bg-white">
                            <Image
                              src={review.image}
                              alt={review.imageAlt}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                        </div>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                          &ldquo;{renderQuote(review.quote)}&rdquo;
                        </p>
                        {(review.reviewerName || review.reviewerTitle) && (
                          <div className="text-center">
                            {review.reviewerName && (
                              <p className="text-base font-semibold text-foreground">
                                {review.reviewerName}
                              </p>
                            )}
                            {review.reviewerTitle && (
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                                {review.reviewerTitle}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="mt-6 flex justify-center gap-2 lg:hidden">
            {reviews.map((_, index) => (
              <button
                type="button"
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  selectedIndex === index
                    ? "bg-primary"
                    : "bg-primary/30"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}