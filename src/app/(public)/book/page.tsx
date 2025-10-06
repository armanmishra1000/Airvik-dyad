"use client";

import * as React from "react";
import { RoomTypeCard } from "@/components/public/room-type-card";
import {
  BookingWidget,
  type BookingSearchFormValues,
} from "@/components/public/booking-widget";
import { useAvailabilitySearch } from "@/hooks/use-availability-search";
import { useDataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookingSummary } from "@/components/public/booking-summary";
import type { RoomType } from "@/data/types";
import { TriangleAlert } from "lucide-react";

export default function RoomsPage() {
  const { roomTypes, isLoading: isInitialLoading } = useDataContext();
  const {
    search,
    availableRoomTypes,
    isLoading: isSearching,
    setAvailableRoomTypes,
  } = useAvailabilitySearch();
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

  const showLoading = isInitialLoading || isSearching;

  return (
    /* Main Content */
    <div className="py-8">
      {/* Booking Widget */}
      <section className="py-8 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-serif mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Search available rooms and book your spiritual retreat at Sahajanand Ashram
            </p>
          </div>
          <BookingWidget onSearch={handleSearch} />
        </div>
      </section>

      {/* Room Types */}
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

          {showLoading ? (
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
                /* No Rooms Found */
                <div className="py-16 border rounded-lg bg-muted/40">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-primary md:size-14 size-12 rounded-full flex items-center justify-center">
                      <TriangleAlert className="text-primary-foreground sm:size-8 size-6" />
                    </div>
                    <h3 className="text-xl font-semibold">No Rooms Found</h3>
                    <p className="text-muted-foreground">
                      {hasSearched
                        ? "Sorry, no rooms are available for your selected dates. Please try different dates."
                        : "There are no room types configured for this property."}
                    </p>
                  </div>
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