"use client";

import * as React from "react";
import { RoomTypeCard } from "@/components/public/room-type-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TriangleAlert } from "lucide-react";
import { useDataContext } from "@/context/data-context";
import Link from "next/link";

export function OurRoomsSection() {
  const { roomTypes, isLoading: isInitialLoading } = useDataContext();
  const visibleRoomTypes = React.useMemo(
    () => (roomTypes ?? []).filter((roomType) => roomType.isVisible !== false),
    [roomTypes]
  );

  return (
    <section className="py-16 md:py-24 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
            Our Rooms
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience spiritual comfort in our thoughtfully designed accommodations, each offering a unique blend of tranquility and modern amenities.
          </p>
        </div>

        {isInitialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className=" border rounded-lg">
                <Skeleton className="h-60 w-full rounded-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {visibleRoomTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {visibleRoomTypes.slice(0, 6).map((roomType) => (
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
            ) : (
              <div className="py-16 border rounded-lg bg-muted/40">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="bg-primary md:size-14 size-12 rounded-full flex items-center justify-center">
                    <TriangleAlert className="text-primary-foreground sm:size-8 size-6" />
                  </div>
                  <h3 className="text-xl font-semibold">No Rooms Found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    There are no room types configured for this property.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary-hover">
            <Link href="/book">
              View All Rooms
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}