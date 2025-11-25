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
import { toast } from "sonner";

export default function RoomsPage() {
  const { roomTypes, isLoading: isInitialLoading } = useDataContext();
  const {
    search,
    availableRoomTypes,
    roomTypeAvailability,
    isLoading: isSearching,
    setAvailableRoomTypes,
    setRoomTypeAvailability,
    hasNoInventory,
  } = useAvailabilitySearch();
  const [hasSearched, setHasSearched] = React.useState(false);
  const [searchValues, setSearchValues] =
    React.useState<EnhancedBookingSearchFormValues | null>(null);

  type SelectedRoomTypeQuantity = {
    roomTypeId: string;
    quantity: number;
  };

  const [selectedRoomQuantities, setSelectedRoomQuantities] =
    React.useState<SelectedRoomTypeQuantity[]>([]);

  const handleSearch = (values: EnhancedBookingSearchFormValues) => {
    search(values.dateRange, values.roomOccupancies);
    setHasSearched(true);
    setSearchValues(values);
    setSelectedRoomQuantities([]); // Clear previous selection on new search
  };

  const handleClearSearch = () => {
    setHasSearched(false);
    setAvailableRoomTypes(null);
    setRoomTypeAvailability(null);
    setSearchValues(null);
    setSelectedRoomQuantities([]);
  };
  const availabilityByRoomTypeId = React.useMemo(() => {
    const map = new Map<string, number>();
    if (roomTypeAvailability) {
      roomTypeAvailability.forEach((item) => {
        map.set(item.roomTypeId, item.availableRooms);
      });
    }
    return map;
  }, [roomTypeAvailability]);

  const getSelectedQuantity = React.useCallback(
    (roomTypeId: string): number => {
      const entry = selectedRoomQuantities.find(
        (item) => item.roomTypeId === roomTypeId,
      );
      return entry ? entry.quantity : 0;
    },
    [selectedRoomQuantities],
  );

  const updateSelectedQuantity = React.useCallback(
    (roomTypeId: string, quantity: number) => {
      setSelectedRoomQuantities((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => item.roomTypeId !== roomTypeId);
        }

        const existingIndex = prev.findIndex(
          (item) => item.roomTypeId === roomTypeId,
        );

        if (existingIndex === -1) {
          return [...prev, { roomTypeId, quantity }];
        }

        const next = [...prev];
        next[existingIndex] = { roomTypeId, quantity };
        return next;
      });
    },
    [],
  );

  const selectedRooms: RoomType[] = React.useMemo(() => {
    if (!selectedRoomQuantities.length) return [];
    const byId = new Map(roomTypes.map((rt) => [rt.id, rt] as const));
    const result: RoomType[] = [];

    selectedRoomQuantities.forEach(({ roomTypeId, quantity }) => {
      const rt = byId.get(roomTypeId);
      if (!rt) return;
      for (let index = 0; index < quantity; index += 1) {
        result.push(rt);
      }
    });

    return result;
  }, [roomTypes, selectedRoomQuantities]);

  const totalSelectedRooms = selectedRooms.length;

  const   totalGuests = React.useMemo(() => {
    if (!searchValues) return 0;
    return searchValues.roomOccupancies.reduce(
      (sum, occ) => sum + occ.adults + occ.children,
      0,
    );
  }, [searchValues]);

  const requestedRooms = React.useMemo(() => {
    if (!searchValues) return 0;
    return searchValues.roomOccupancies.length;
  }, [searchValues]);

  const totalSelectedCapacity = React.useMemo(() => {
    if (!selectedRoomQuantities.length) return 0;
    const byId = new Map(roomTypes.map((rt) => [rt.id, rt] as const));
    return selectedRoomQuantities.reduce((sum, { roomTypeId, quantity }) => {
      const rt = byId.get(roomTypeId);
      if (!rt) return sum;
      return sum + quantity * rt.maxOccupancy;
    }, 0);
  }, [roomTypes, selectedRoomQuantities]);

  const coversGuests = searchValues
    ? totalSelectedCapacity >= totalGuests
    : false;

  const canAddMoreRooms = React.useMemo(() => {
    if (!searchValues) return true;
    if (totalGuests === 0) return true;
    return totalSelectedCapacity < totalGuests;
  }, [searchValues, totalGuests, totalSelectedCapacity]);

  const dateAvailableRoomTypes: RoomType[] | null = React.useMemo(() => {
    if (!roomTypeAvailability) return null;
    const byId = new Map(roomTypes.map((rt) => [rt.id, rt] as const));
    const types: RoomType[] = [];
    roomTypeAvailability.forEach((summary) => {
      const rt = byId.get(summary.roomTypeId);
      if (rt) {
        types.push(rt);
      }
    });
    return types;
  }, [roomTypes, roomTypeAvailability]);

  const maxSingleRoomCapacity = React.useMemo(() => {
    if (!dateAvailableRoomTypes || dateAvailableRoomTypes.length === 0) {
      return 0;
    }
    return dateAvailableRoomTypes.reduce<number>(
      (max, rt) => (rt.maxOccupancy > max ? rt.maxOccupancy : max),
      0,
    );
  }, [dateAvailableRoomTypes]);

  const noMatchingTypes =
    hasSearched &&
    !hasNoInventory &&
    (availableRoomTypes === null || availableRoomTypes.length === 0);

  const hasDateAvailability =
    dateAvailableRoomTypes !== null && dateAvailableRoomTypes.length > 0;

  const isOverCapacityForAnyRoom =
    noMatchingTypes && hasDateAvailability && totalGuests > maxSingleRoomCapacity;

  const shouldShowMultiRoomFallback = noMatchingTypes && hasDateAvailability;

  const primaryRoomsToDisplay = hasSearched ? availableRoomTypes : roomTypes;
  const roomsToDisplay =
    shouldShowMultiRoomFallback && dateAvailableRoomTypes
      ? dateAvailableRoomTypes
      : primaryRoomsToDisplay;

  const showLoading = isInitialLoading || isSearching;

  const showCapacityLockedToast = React.useCallback(
    (guestCount: number) => {
      toast(
        `You have already selected rooms for ${guestCount} guest${guestCount === 1 ? "" : "s"}. If you want to select other rooms, please unselect the selected rooms first.`,
      );
    },
    [],
  );

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
                  {shouldShowMultiRoomFallback && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs sm:text-sm text-amber-900">
                      <p className="font-medium">
                        {requestedRooms === 1
                          ? `We don't have any single room available for ${totalGuests} guest${
                              totalGuests === 1 ? "" : "s"
                            }.`
                          : `We can't match your exact request for ${totalGuests} guest${
                              totalGuests === 1 ? "" : "s"
                            } across ${requestedRooms} room${
                              requestedRooms === 1 ? "" : "s"
                            }.`}
                      </p>
                      <p className="mt-1">
                        You can still stay with us by booking multiple rooms. Choose one or
                        more room types below so the total capacity is at least {totalGuests} guest
                        {totalGuests === 1 ? "" : "s"}.
                      </p>
                      {isOverCapacityForAnyRoom && (
                        <p className="mt-1 text-[11px] sm:text-xs">
                          No single room type can hold all guests, but a combination of
                          multiple rooms can. Pick any mix of room types below.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
                    {roomsToDisplay.map((roomType) => (
                      <div key={roomType.id} className="space-y-2">
                        <RoomTypeCard
                          roomType={roomType}
                          price={roomType.price}
                          // Selection is now handled via checkbox + quantity below
                          onSelect={() => {}}
                          isSelectionComplete
                          hasSearched={hasSearched}
                          searchValues={searchValues}
                        />

                        {hasSearched &&
                          !hasNoInventory &&
                          roomTypeAvailability && (
                            <div className="mt-1 rounded-lg border border-border/40 bg-white px-3 py-2 text-xs sm:text-sm flex flex-col gap-2">
                              {(() => {
                                const availableCount =
                                  availabilityByRoomTypeId.get(roomType.id) ?? 0;
                                const selectedQuantity = getSelectedQuantity(
                                  roomType.id,
                                );

                                const isSelected = selectedQuantity > 0;
                                const checkboxDisabled = !isSelected && !canAddMoreRooms;

                                return (
                                  <>
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-muted-foreground">
                                        {availableCount > 0
                                          ? `${availableCount} room${
                                              availableCount === 1 ? "" : "s"
                                            } available for your dates`
                                          : "No rooms currently available for this type"}
                                      </p>
                                      {availableCount > 0 && (
                                        <label
                                          className="inline-flex items-center gap-2"
                                          onClick={(event) => {
                                            if (checkboxDisabled && !isSelected) {
                                              event.preventDefault();
                                              if (totalGuests > 0) {
                                                showCapacityLockedToast(totalGuests);
                                              }
                                            }
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-border/60"
                                            checked={isSelected}
                                            disabled={checkboxDisabled}
                                            aria-disabled={checkboxDisabled}
                                            onChange={(event) => {
                                              if (event.target.checked) {
                                                updateSelectedQuantity(
                                                  roomType.id,
                                                  Math.max(1, selectedQuantity || 0),
                                                );
                                              } else {
                                                updateSelectedQuantity(
                                                  roomType.id,
                                                  0,
                                                );
                                              }
                                            }}
                                          />
                                          <span>Select</span>
                                        </label>
                                      )}
                                    </div>

                                    {selectedQuantity > 0 && availableCount > 0 && (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-muted-foreground">
                                          Rooms
                                        </span>
                                        <select
                                          className="border border-border/60 bg-white px-2 py-1 text-xs sm:text-sm rounded-md"
                                          value={selectedQuantity}
                                          onChange={(event) => {
                                            const nextQuantity = Number(
                                              event.target.value,
                                            );

                                            if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
                                              return;
                                            }

                                            const isIncrease =
                                              nextQuantity > selectedQuantity;

                                            if (isIncrease && !canAddMoreRooms) {
                                              event.target.value = String(
                                                selectedQuantity,
                                              );
                                              if (totalGuests > 0) {
                                                showCapacityLockedToast(
                                                  totalGuests,
                                                );
                                              }
                                              return;
                                            }

                                            updateSelectedQuantity(
                                              roomType.id,
                                              nextQuantity,
                                            );
                                          }}
                                        >
                                          {Array.from(
                                            { length: availableCount },
                                            (_, index) => index + 1,
                                          ).map((count) => (
                                            <option key={count} value={count}>
                                              {count}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                  {hasSearched && searchValues && !hasNoInventory && (
                    <div className="mt-8 max-w-xl space-y-1 text-sm">
                      <p>
                        Selected {totalSelectedRooms} room
                        {totalSelectedRooms === 1 ? "" : "s"}
                        {totalGuests > 0 && (
                          <>
                            {" "}
                            · Capacity for {totalSelectedCapacity} guest
                            {totalSelectedCapacity === 1 ? "" : "s"} (you
                            searched for {totalGuests} guest
                            {totalGuests === 1 ? "" : "s"})
                          </>
                        )}
                      </p>
                      {!coversGuests && totalSelectedRooms > 0 && (
                        <p className="text-xs text-red-600">
                          Selected rooms do not yet cover all guests. Add
                          more rooms until the total capacity is at least {totalGuests} guest
                          {totalGuests === 1 ? "" : "s"} to continue.
                        </p>
                      )}
                    </div>
                  )}
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
      {hasSearched && searchValues && selectedRooms.length > 0 && (
        <BookingSummary
          selection={selectedRooms}
          searchValues={searchValues}
          onRemove={(index) => {
            const roomToRemove = selectedRooms[index];
            if (!roomToRemove) return;
            const currentQuantity = getSelectedQuantity(roomToRemove.id);
            updateSelectedQuantity(roomToRemove.id, currentQuantity - 1);
          }}
          onClear={() => setSelectedRoomQuantities([])}
        />
      )}
    </div>
  );
}
