"use client";

import * as React from "react";
import { RoomTypeCard } from "@/components/public/room-type-card";
import {
  BookingWidget,
  type EnhancedBookingSearchFormValues,
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
    hasNoInventory,
  } = useAvailabilitySearch();
  const [hasSearched, setHasSearched] = React.useState(false);
  const [searchValues, setSearchValues] =
    React.useState<EnhancedBookingSearchFormValues | null>(null);
  const [selection, setSelection] = React.useState<RoomType[]>([]);

  const handleSearch = (values: EnhancedBookingSearchFormValues) => {
    search(values.dateRange, values.roomOccupancies);
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
    if (searchValues) {
      // Calculate number of rooms based on roomOccupancies
      const roomCount = searchValues.roomOccupancies.length;
      
      if (selection.length < roomCount) {
        setSelection((prev) => [...prev, roomType]);
      }
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
    ? selection.length >= searchValues.roomOccupancies.length
    : false;

  const showLoading = isInitialLoading || isSearching;

  return (
    /* Main Content */
    <div>
      {/* Booking Widget */}
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-primary/5 via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="2xl:text-5xl md:text-4xl text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Find Your Perfect Stay
            </h1>
            <p className="text-base text-muted-foreground md:text-lg max-w-lg lg:max-w-4xl mx-auto">
              Discover peace and tranquility at Sahajanand Ashram. Search for
              your ideal accommodation.
            </p>
          </div>
          <BookingWidget onSearch={handleSearch} />
        </div>
      </section>

      {/* Room Types */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <h2 className="text-3xl font-bold">
              {hasSearched ? "Available Rooms" : "Our Rooms"}
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {hasSearched && (
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  className="h-11 px-4 shadow-sm hover:border-primary/40 hover:bg-primary/5 rounded-xl border-border/60 bg-background"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Clear Search & View All
                </Button>
              )}
            </div>
          </div>

          {/* room skeleton */}
          {showLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col border border-border/40 overflow-hidden rounded-2xl shadow-lg">
                  {/* Image skeleton */}
                  <div className="relative h-32 md:h-40 overflow-hidden">
                    <Skeleton className="h-full w-full" />
                    {/* Bed type badge skeleton */}
                    <div className="absolute top-4 right-4">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Content skeleton */}
                  <div className="flex flex-col flex-1 bg-white">
                    {/* Title and description */}
                    <div className="flex flex-col p-4 pb-2 gap-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full mt-1" />
                    </div>
                    
                    {/* Footer */}
                    <div className="flex flex-col gap-1 px-4 pb-4 pt-0">
                      {/* Amenities and guests */}
                      <div className="flex gap-4 justify-between">
                        <Skeleton className="h-4 w-28" />
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                      </div>
                      {/* Price */}
                      <div className="flex items-center pt-1 gap-1">
                        <Skeleton className="h-4 w-44" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {roomsToDisplay && roomsToDisplay.length > 0 ? (
                <>
                  {hasSearched && hasNoInventory && (
                    <div className="mb-6 p-3 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-xl">
                      <p className="text-amber-900 dark:text-amber-100 text-sm">
                        <strong>Note:</strong> Room inventory is not fully
                        configured. Showing available room types based on
                        occupancy requirements. Please contact us for exact
                        availability.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
                    {roomsToDisplay.map((roomType) => (
                      <RoomTypeCard
                        key={roomType.id}
                        roomType={roomType}
                        price={roomType.price}
                        onSelect={handleSelectRoom}
                        isSelectionComplete={isSelectionComplete}
                        hasSearched={hasSearched}
                        searchValues={searchValues}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* No Rooms Found */
                <div className="py-16 border border-border/50 rounded-lg bg-white shadow-sm">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-primary md:size-14 size-12 rounded-full flex items-center justify-center">
                      <TriangleAlert className="text-primary-foreground sm:size-8 size-6" />
                    </div>
                    <h3 className="text-xl font-semibold">No Rooms Found</h3>
                    <p className="text-muted-foreground">
                      {hasSearched
                        ? hasNoInventory
                          ? "No room types match your occupancy requirements. Try searching for fewer rooms or guests."
                          : "Sorry, no rooms are available for your selected dates. Please try different dates."
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
