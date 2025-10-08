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
      <div className="container mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-bold font-serif text-center text-foreground">
          Your Spiritual Sanctuary
        </h2>
        <p className="mt-4 text-lg text-muted-foreground text-center max-w-2xl mx-auto">
          Sanctified spaces for every devotee’s stay.
        </p>

        <div className="relative mt-12">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
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
                    className="pl-4 basis-full sm:basis-3/4 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full">
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
                          <div className="flex justify-start gap-3 overflow-x-auto sm:overflow-visible">
                            {room.amenities.map((amenity) => (
                              <div
                                key={amenity.label}
                                className="flex h-8 shrink-0 items-center gap-2 rounded-full border border-border/50 px-3 py-2 text-sm text-muted-foreground"
                              >
                                <amenity.icon className="h-4 w-4" />
                                <span>{amenity.label}</span>
                              </div>
                            ))}
                          </div>
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
            <CarouselPrevious className="absolute left-1 top-[48%] -translate-y-1/2 -translate-x-1/2 rounded-full h-10 w-10  bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground z-10" />
            <CarouselNext className="absolute right-1 top-[48%] -translate-y-1/2 translate-x-1/2 rounded-full h-10 w-10  bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground z-10" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
