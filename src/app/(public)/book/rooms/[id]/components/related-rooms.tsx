"use client";

import * as React from "react";

import { RoomTypeCard } from "@/components/public/room-type-card";
import type { RoomType } from "@/data/types";

interface RelatedRoomsProps {
  roomTypes: RoomType[];
}

export function RelatedRooms({ roomTypes }: RelatedRoomsProps) {
  if (roomTypes.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold font-serif text-foreground mb-8">Related Rooms</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {roomTypes.slice(0, 4).map((roomType) => (
          <RoomTypeCard
            key={roomType.id}
            roomType={roomType}
            price={roomType.price}
            hasSearched={false}
            onSelect={() => {}}
            isSelectionComplete={false}
          />
        ))}
      </div>
    </div>
  );
}
