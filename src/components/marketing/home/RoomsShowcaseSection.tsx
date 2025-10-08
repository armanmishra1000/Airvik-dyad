"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDataContext } from "@/context/data-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Wifi,
  ConciergeBell,
  Bath,
  Utensils,
  Users,
  Leaf,
  Sparkles,
  Bed,
  Sun,
  type LucideIcon,
} from "lucide-react";

type Amenity = {
  icon: LucideIcon;
  label: string;
};

const normalizeRoomName = (value: string) =>
  value.split("[")[0].trim().toLowerCase();

const roomsData: Array<{
  heading: string;
  description: string;
  image: string;
  amenities: Amenity[];
}> = [
  {
    heading: "AnnaDaan [Premium Room] 2",
    description:
      "Services like currency exchange and luggage storage are available. The in-house restaurant, The Great Room, serves Indian and continental delights which can also be enjoyed here.",
    image: "/annakshetra.png",
    amenities: [
      { icon: Wifi, label: "Wi-Fi" },
      { icon: ConciergeBell, label: "Concierge" },
      { icon: Bath, label: "Bath" },
    ],
  },
  {
    heading: "Sant Bhojan Donation [Family Premium] 4",
    description:
      "We must inform all the devotees that this is not a hotel but a dharmshala run by a religious trust (Sahajanand Wellness) for serving the pilgrims and saints. Therefore, we don't provide any television or entertainment features.",
    image: "/Dining Hall.png",
    amenities: [
      { icon: Wifi, label: "Wi-Fi" },
      { icon: Utensils, label: "Dining" },
      { icon: Users, label: "Family" },
    ],
  },
  {
    heading: "Brahmbhoj [Semi Deluxe] 2",
    description:
      "We must inform all the devotees that this is not a hotel but a dharmshala run by a religious trust (Sahajanand Wellness) for serving the pilgrims and saints.",
    image: "/Spiritual Spaces.png",
    amenities: [
      { icon: Wifi, label: "Wi-Fi" },
      { icon: Leaf, label: "Serenity" },
      { icon: Sparkles, label: "Cleanse" },
    ],
  },
  {
    heading: "VidhyaDan [Family Room] 4",
    description:
      "We must inform all the devotees that this is not a hotel but a dharmshala run by a religious trust (Sahajanand Wellness) for serving the pilgrims and saints.",
    image: "/gallery-room-05-2-1.png",
    amenities: [
      { icon: Wifi, label: "Wi-Fi" },
      { icon: Bed, label: "Comfort" },
      { icon: Sun, label: "Light" },
    ],
  },
];

export function RoomsShowcaseSection() {
  const { roomTypes } = useDataContext();

  return (
    <section className="bg-background py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-bold font-serif text-center text-foreground">
          Your Spiritual Sanctuary
        </h2>
        <p className="mt-4 text-lg text-muted-foreground text-center max-w-2xl mx-auto">
          Sanctified spaces for every devotee’s stay.
        </p>

        <div className="relative mt-12">
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent className="-ml-4">
              {roomsData.map((room) => {
                const lookupKey = normalizeRoomName(room.heading);
                const matchedRoomType = roomTypes?.find(
                  (roomType) => normalizeRoomName(roomType.name) === lookupKey
                );
                const targetHref = matchedRoomType
                  ? `/book/rooms/${matchedRoomType.id}`
                  : "/book";
                const imageUrl =
                  matchedRoomType?.mainPhotoUrl ??
                  matchedRoomType?.photos?.[0] ??
                  room.image;

                return (
                  <CarouselItem
                    key={room.heading}
                    className="basis-full p-0 sm:basis-3/4 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full p-4 ml-3">
                      <Card className="flex h-full flex-col overflow-hidden bg-card rounded-2xl">
                        <div className="relative aspect-[3/2] w-full h-56">
                          <Image
                            src={imageUrl}
                            alt={room.heading}
                            fill
                            className="rounded-t-2xl object-cover"
                            priority={false}
                          />
                        </div>
                        <CardContent className="flex flex-1 flex-col gap-4 p-6 bg-white">
                          <div className="overflow-hidden">
                            <CardTitle className="text-xl font-serif font-semibold truncate">
                              {room.heading}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                            {room.description}
                          </CardDescription>
                          <TooltipProvider delayDuration={100}>
                            <div className="flex justify-strat gap-4 overflow-x-auto sm:overflow-visible">
                              {room.amenities.map((amenity) => (
                                <Tooltip key={amenity.label}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    aria-label={amenity.label}
                                    className="flex shrink-0 items-center justify-center rounded-full"
                                  >
                                    <amenity.icon className="h-4 w-4 text-primary-hover" />
                                  </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="relative border-none bg-primary text-primary-foreground text-[0.65rem] font-semibold uppercase tracking-[0.2em] before:absolute before:h-2 before:w-2 before:bg-primary before:content-[''] before:rotate-45 data-[side=top]:before:-bottom-1 data-[side=top]:before:left-1/2 data-[side=top]:before:-translate-x-1/2 data-[side=bottom]:before:-top-1 data-[side=bottom]:before:left-1/2 data-[side=bottom]:before:-translate-x-1/2 data-[side=left]:before:-right-1 data-[side=left]:before:top-1/2 data-[side=left]:before:-translate-y-1/2 data-[side=right]:before:-left-1 data-[side=right]:before:top-1/2 data-[side=right]:before:-translate-y-1/2">
                                    {amenity.label}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </TooltipProvider>
                          <Button asChild className="mt-auto w-full bg-primary hover:bg-primary-hover">
                            <Link href={targetHref}>Book Now</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 top-[50%] -translate-x-1/2 rounded-full bg-card border border-primary  h-10 w-10 text-primary hover:bg-primary hover:text-primary-foreground" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 top-[50%] translate-x-1/2 rounded-full bg-card border border-primary h-10 w-10 text-primary hover:bg-primary hover:text-primary-foreground" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
