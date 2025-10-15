"use client";

import * as React from "react";
import { notFound, useParams } from "next/navigation";

import { useDataContext } from "@/context/data-context";
import { RoomDetailsSkeleton } from "@/components/public/room-details-skeleton";
import { cn } from "@/lib/utils";

import { RoomHeader } from "./components/room-header";
import { RoomGallery } from "./components/room-gallery";
import { RoomDetails } from "./components/room-details";
import { BookingCard } from "./components/booking-card";
import { RelatedRooms } from "./components/related-rooms";
import { useRoomPhotos } from "./hooks/use-room-photos";

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();
  const {
    reservations,
    roomTypes,
    amenities,
    rooms,
    ratePlans,
    isLoading,
  } = useDataContext();

  const roomType = roomTypes.find((item) => item.id === params.id);
  const { photosToShow, galleryPhotos } = useRoomPhotos(roomType);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  if (isLoading) {
    return <RoomDetailsSkeleton />;
  }

  if (!roomType) {
    notFound();
  }

  const relatedRoomTypes = roomTypes.filter((item) => item.id !== roomType.id);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 sm:px-6 lg:px-8 py-6">
        <RoomHeader name={roomType.name} description={roomType.description} />

        <RoomGallery
          roomName={roomType.name}
          photosToShow={photosToShow}
          galleryPhotos={galleryPhotos}
          isGalleryOpen={isGalleryOpen}
          onGalleryOpenChange={setIsGalleryOpen}
        />

        <div className="grid lg:grid-cols-5 gap-x-12">
          <div className="lg:col-span-3 space-y-8">
            <RoomDetails roomType={roomType} amenities={amenities} />
          </div>

          <div
            className={cn(
              "lg:col-span-2 mt-8 lg:mt-0 lg:self-start",
              isGalleryOpen && "pointer-events-none opacity-0",
            )}
            id="booking-form"
          >
            <BookingCard
              roomType={roomType}
              ratePlans={ratePlans}
              reservations={reservations}
              rooms={rooms}
            />
          </div>
        </div>

        <RelatedRooms roomTypes={relatedRoomTypes} />
      </div>
    </div>
  );
}