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
import { Icon } from "@/components/shared/icon";
import type { IconName } from "@/lib/icons";

const normalizeName = (value: string) => value.split("[")[0].trim().toLowerCase();

const amenityIconMap: Record<string, IconName> = {
  "Free Wi-Fi": "Wifi",
  "Air Conditioning": "AirVent",
  "Flat-screen TV": "Tv",
  "Mini-bar": "Refrigerator",
  "Ocean View": "Waves",
  "Private Balcony": "GalleryVertical",
  "Ensuite Bathroom": "Bath",
  "Room Service": "ConciergeBell",
  "Lounge chairs": "Armchair",
  "Washing Machine": "WashingMachine",
  Refrigerator: "Refrigerator",
  Bedroom: "Bed",
  Oven: "CookingPot",
  Wifi: "Wifi",
  Bathroom: "Bath",
  "Air Conditioner": "AirVent",
  "Swimming Pool": "Waves",
};

const normalizeAmenityName = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

export function RoomsShowcaseSection() {
  const { roomTypes, amenities } = useDataContext();

  const featuredOrder = [
    "AnnaDaan",
    "Sant Bhojan Donation",
    "Brahmbhoj",
    "VidhyaDan",
  ];

  const fallbackImages: Record<string, string> = {
    annadaan: "/annakshetra.png",
    "sant bhojan donation": "/Dining Hall.png",
    brahmbhoj: "/Spiritual Spaces.png",
    vidhyadan: "/gallery-room-05-2-1.png",
  };

  const featuredRoomTypes = featuredOrder
    .map((name) => {
      const match = roomTypes?.find(
        (roomType) => normalizeName(roomType.name) === normalizeName(name)
      );

      if (!match) {
        return null;
      }

      const normalizedKey = normalizeName(name);
      const imageUrl =
        match.mainPhotoUrl ??
        match.photos?.[0] ??
        fallbackImages[normalizedKey] ??
        "";

      const amenityRecords = match.amenities
        ?.map((amenityId) =>
          amenities?.find((amenity) => amenity.id === amenityId)
        )
        .filter((amenity): amenity is NonNullable<typeof amenity> => Boolean(amenity))
        .slice(0, 3)
        .map((amenity) => {
          const key = normalizeAmenityName(amenity.name);
          const directMatch = amenityIconMap[amenity.name];
          const normalizedMatch = Object.entries(amenityIconMap).find(
            ([label]) => normalizeAmenityName(label) === key
          )?.[1];
          const iconName =
            directMatch ??
            normalizedMatch ??
            amenity.icon ??
            "HelpCircle";

          return {
            ...amenity,
            iconName,
          };
        });

      return {
        id: match.id,
        name: match.name,
        description: match.description ?? "",
        imageUrl,
        amenities: amenityRecords ?? [],
      };
    })
    .filter((room): room is NonNullable<typeof room> => Boolean(room));

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
              {featuredRoomTypes.map((room) => (
                <CarouselItem
                    key={room.id}
                    className="pl-4 basis-full sm:basis-3/4 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full">
                      <Card className="flex h-full flex-col overflow-hidden bg-card rounded-2xl">
                        <div className="relative aspect-[3/2] w-full h-56">
                          <Image
                            src={room.imageUrl}
                            alt={room.name}
                            fill
                            className="rounded-t-2xl object-cover"
                            priority={false}
                          />
                        </div>
                        <CardContent className="flex flex-1 flex-col gap-4 p-6 bg-white">
                          <div className="overflow-hidden">
                            <CardTitle className="text-xl font-serif font-semibold truncate">
                              {room.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                            {room.description}
                          </CardDescription>
                          <div className="flex justify-start gap-3 overflow-x-auto sm:overflow-visible">
                            {room.amenities.map((amenity) => (
                              <div
                                key={amenity.id}
                                className="flex h-8 shrink-0 items-center gap-2 rounded-full border border-border/50 px-3 py-2 text-sm text-muted-foreground"
                              >
                                <Icon name={amenity.iconName} className="h-4 w-4 text-primary-hover" />
                                <span>{amenity.name}</span>
                              </div>
                            ))}
                          </div>
                          <Button asChild className="mt-auto w-full bg-primary hover:bg-primary-hover">
                            <Link href={`/book/rooms/${room.id}`}>Book Now</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-1 top-[48%] -translate-y-1/2 -translate-x-1/2 rounded-full h-10 w-10  bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground z-10" />
            <CarouselNext className="absolute right-1 top-[48%] -translate-y-1/2 translate-x-1/2 rounded-full h-10 w-10  bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground z-10" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
