"use client";

import * as React from "react";
import { RoomTypeCard } from "@/components/public/room-type-card";
import {
  BookingWidget,
  type BookingSearchFormValues,
} from "@/components/public/booking-widget";
import { useAvailabilitySearch } from "@/hooks/use-availability-search";
import { useAppContext } from "@/context/app-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookingSummary } from "@/components/public/booking-summary";
import type { RoomType } from "@/data";

export default function PublicHomePage() {
  const { roomTypes } = useAppContext();
  const { search, availableRoomTypes, isLoading, setAvailableRoomTypes } =
    useAvailabilitySearch();
  const [hasSearched, setHasSearched] = React.useState(false);
  const [searchValues, setSearchValues] =
    React.useState<BookingSearchFormValues | null>(null);
  const [selection, setSelection] = React.useState<RoomType[]>([]);

  const handleSearch = (values: BookingSearchFormValues) => {
    search(values.dateRange, values.guests, values.children, values.rooms);
    setHasSearched(true);
    setSearchValues(values);
    setSelection([]); // Clear previous selection on new search
  };

  const handleClearSearch = () => {
    setHasSearched(false);
    setAvailableRoomTypes(null);
    setSearchValues(null);
    setSelection([]);
  };

  const handleSelectRoom = (roomType: RoomType) => {
    if (searchValues && selection.length < searchValues.rooms) {
      setSelection((prev) => [...prev, roomType]);
    }
  };

  const handleRemoveRoom = (index: number) => {
    setSelection((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearSelection = () => {
    setSelection([]);
  };

  const roomsToDisplay = hasSearched ? availableRoomTypes : roomTypes;
  const isSelectionComplete = searchValues
    ? selection.length >= searchValues.rooms
    : false;

  return (
    <div>
      <section className="py-12 md:py-20 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-serif">
            Experience Unmatched Comfort
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Explore our collection of beautifully designed rooms and suites,
            each offering a unique blend of luxury and tranquility.
          </p>
        </div>
        <div className="container mx-auto px-4 mt-8">
          <BookingWidget onSearch={handleSearch} />
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">
              {hasSearched ? "Available Rooms" : "Our Rooms"}
            </h2>
            {hasSearched && (
              <Button variant="link" onClick={handleClearSearch}>
                Clear Search & View All
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {roomsToDisplay && roomsToDisplay.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {roomsToDisplay.map((roomType) => (
                    <RoomTypeCard
                      key={roomType.id}
                      roomType={roomType}
                      onSelect={handleSelectRoom}
                      isSelectionComplete={isSelectionComplete}
                      hasSearched={hasSearched}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                  <h3 className="text-xl font-semibold">No Rooms Found</h3>
                  <p className="text-muted-foreground mt-2">
                    {hasSearched
                      ? "Sorry, no rooms are available for your selected dates. Please try different dates."
                      : "There are no room types configured for this property."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {hasSearched && searchValues && selection.length > 0 && (
        <BookingSummary
          selection={selection}
          searchValues={searchValues}
          onRemove={handleRemoveRoom}
          onClear={handleClearSelection}
        />
      )}
    </div>
  );
}