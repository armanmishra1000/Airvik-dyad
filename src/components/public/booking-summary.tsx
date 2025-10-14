"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { RoomType } from "@/data/types";
import type { BookingSearchFormValues } from "./booking-widget";
import { useDataContext } from "@/context/data-context";
import { priceStay, type PricingResult } from "@/lib/pricing-service";

type PricingStatus = "idle" | "loading" | "success" | "error";

interface PricingState {
  status: PricingStatus;
  data?: PricingResult;
  error?: string;
  paramsKey?: string;
  ratePlanId?: string;
}

interface BookingSummaryProps {
  selection: RoomType[];
  searchValues: BookingSearchFormValues;
  onRemove: (index: number) => void;
  onClear: () => void;
}

export function BookingSummary({
  selection,
  searchValues,
  onRemove,
  onClear,
}: BookingSummaryProps) {
  const router = useRouter();
  const { ratePlans } = useDataContext();
  const { dateRange, rooms: requestedRooms } = searchValues;

  const [pricingByRoomType, setPricingByRoomType] = React.useState<Record<string, PricingState>>({});

  const checkInDate = dateRange?.from ?? null;
  const checkOutDate = dateRange?.to ?? null;
  const shouldHideSummary = selection.length === 0 || !checkInDate || !checkOutDate;

  const nights =
    checkInDate && checkOutDate ? differenceInCalendarDays(checkOutDate, checkInDate) : 0;
  const checkIn = React.useMemo(
    () => (checkInDate ? format(checkInDate, "yyyy-MM-dd") : null),
    [checkInDate]
  );
  const checkOut = React.useMemo(
    () => (checkOutDate ? format(checkOutDate, "yyyy-MM-dd") : null),
    [checkOutDate]
  );

  const uniqueRoomTypes = React.useMemo(() => {
    const map = new Map<string, RoomType>();
    selection.forEach((roomType) => {
      if (!map.has(roomType.id)) {
        map.set(roomType.id, roomType);
      }
    });
    return Array.from(map.values());
  }, [selection]);

  const resolveRatePlanId = React.useCallback(
    (roomType: RoomType) => {
      const typedRoomType = roomType as RoomType & {
        primaryRatePlanId?: string | null;
        ratePlanId?: string | null;
        assignedRatePlanId?: string | null;
      };

      const candidatePlanId =
        typedRoomType.primaryRatePlanId ||
        typedRoomType.ratePlanId ||
        typedRoomType.assignedRatePlanId ||
        null;

      if (candidatePlanId) {
        const match = ratePlans.find((plan) => plan.id === candidatePlanId);
        if (match) {
          return match.id;
        }
      }

      const standardPlan = ratePlans.find((plan) => plan.name === "Standard Rate");
      if (standardPlan) {
        return standardPlan.id;
      }

      return ratePlans[0]?.id ?? null;
    },
    [ratePlans]
  );

  React.useEffect(() => {
    if (!uniqueRoomTypes.length) {
      setPricingByRoomType({});
      return;
    }

    setPricingByRoomType((previous) => {
      const next = { ...previous };
      const activeIds = new Set(uniqueRoomTypes.map((roomType) => roomType.id));
      Object.keys(next).forEach((key) => {
        if (!activeIds.has(key)) {
          delete next[key];
        }
      });
      return next;
    });

    if (!checkIn || !checkOut) {
      return;
    }

    let isCancelled = false;

    uniqueRoomTypes.forEach((roomType) => {
      const ratePlanId = resolveRatePlanId(roomType);

      if (!ratePlanId) {
        setPricingByRoomType((prev) => ({
          ...prev,
          [roomType.id]: {
            status: "error",
            error: "No rate plan available for this room type.",
          },
        }));
        return;
      }

      const paramsKey = `${ratePlanId}-${checkIn}-${checkOut}`;
      let shouldFetch = false;

      setPricingByRoomType((prev) => {
        const current = prev[roomType.id];
        if (
          current &&
          (current.status === "loading" || current.status === "success") &&
          current.paramsKey === paramsKey
        ) {
          return prev;
        }

        shouldFetch = true;
        return {
          ...prev,
          [roomType.id]: {
            status: "loading",
            ratePlanId,
            paramsKey,
          },
        };
      });

      if (!shouldFetch) {
        return;
      }

      priceStay(roomType.id, ratePlanId, checkIn, checkOut)
        .then((result) => {
          if (isCancelled) return;
          setPricingByRoomType((prev) => {
            const current = prev[roomType.id];
            if (!current || current.paramsKey !== paramsKey) {
              return prev;
            }
            return {
              ...prev,
              [roomType.id]: {
                status: "success",
                data: result,
                paramsKey,
                ratePlanId,
              },
            };
          });
        })
        .catch((error) => {
          if (isCancelled) return;
          setPricingByRoomType((prev) => {
            const current = prev[roomType.id];
            if (!current || current.paramsKey !== paramsKey) {
              return prev;
            }
            return {
              ...prev,
              [roomType.id]: {
                status: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to fetch pricing for this stay.",
                paramsKey,
                ratePlanId,
              },
            };
          });
        });
    });

    return () => {
      isCancelled = true;
    };
  }, [checkIn, checkOut, resolveRatePlanId, uniqueRoomTypes]);

  const pricingViolations = React.useMemo(() => {
    const messages = new Set<string>();
    selection.forEach((roomType) => {
      const result = pricingByRoomType[roomType.id];
      result?.data?.violations.forEach((violation) => messages.add(violation));
    });
    return Array.from(messages);
  }, [pricingByRoomType, selection]);

  const hasPricingErrors = React.useMemo(
    () =>
      selection.some((roomType) => pricingByRoomType[roomType.id]?.status === "error"),
    [pricingByRoomType, selection]
  );

  const isPricingLoading = React.useMemo(
    () =>
      selection.some((roomType) => {
        const state = pricingByRoomType[roomType.id];
        return !state || state.status === "loading";
      }),
    [pricingByRoomType, selection]
  );

  const totalCost = React.useMemo(
    () =>
      selection.reduce((sum, roomType) => {
        const result = pricingByRoomType[roomType.id];
        const total = result?.data?.total;
        if (typeof total === "number") {
          return sum + total;
        }
        return sum;
      }, 0),
    [pricingByRoomType, selection]
  );

  if (shouldHideSummary) {
    return null;
  }

  const handleProceed = () => {
    if (!checkInDate || !checkOutDate) {
      return;
    }
    const query = new URLSearchParams();
    selection.forEach((rt) => query.append("roomTypeId", rt.id));
    query.set("from", format(checkInDate, "yyyy-MM-dd"));
    query.set("to", format(checkOutDate, "yyyy-MM-dd"));
    query.set("guests", searchValues.guests.toString());
    query.set("children", (searchValues.children || 0).toString());
    query.set("rooms", searchValues.rooms.toString());

    router.push(`/book/review?${query.toString()}`);
  };

  const isSelectionComplete = selection.length === requestedRooms;
  const proceedDisabled =
    !isSelectionComplete || isPricingLoading || hasPricingErrors || pricingViolations.length > 0;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm z-50">
      <Card className="shadow-2xl bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-foreground font-serif">
            <span>Your Booking</span>
            <Button variant="ghost" size="icon" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
            {selection.map((roomType, index) => (
              <div
                key={`${roomType.id}-${index}`}
                className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{roomType.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {nights} night{nights === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const pricing = pricingByRoomType[roomType.id];
                      if (!pricing || pricing.status === "loading") {
                        return (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        );
                      }
                      if (pricing.status === "error") {
                        return <span className="text-xs text-destructive">--</span>;
                      }
                      const roomTotal = pricing.data?.total ?? 0;
                      return <span>${roomTotal.toFixed(2)}</span>;
                    })()}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {(() => {
                  const pricing = pricingByRoomType[roomType.id];
                  if (!pricing || pricing.status === "loading") {
                    return (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Calculating nightly pricing...
                      </p>
                    );
                  }

                  if (pricing.status === "error") {
                    return (
                      <p className="mt-2 text-xs text-destructive">
                        {pricing.error || "Pricing unavailable for this room."}
                      </p>
                    );
                  }

                  const items = pricing.data?.items ?? [];

                  return (
                    <div className="mt-2 space-y-1">
                      {items.map((night) => (
                        <div
                          key={`${roomType.id}-${night.day}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-card/80 px-2 py-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">
                              {format(parseISO(night.day), "MMM d, yyyy")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ${Number(night.nightly_rate).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {night.closed && <Badge variant="destructive">Closed</Badge>}
                            {night.cta && <Badge>CTA</Badge>}
                            {night.ctd && <Badge>CTD</Badge>}
                            {typeof night.min_stay === "number" && (
                              <Badge variant="outline">Min {night.min_stay}</Badge>
                            )}
                            {typeof night.max_stay === "number" && (
                              <Badge variant="outline">Max {night.max_stay}</Badge>
                            )}
                            {!night.closed &&
                              !night.cta &&
                              !night.ctd &&
                              typeof night.min_stay !== "number" &&
                              typeof night.max_stay !== "number" && (
                                <span className="text-[0.65rem] text-muted-foreground">
                                  No restrictions
                                </span>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
          <Separator />

          {pricingViolations.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Stay not allowed</AlertTitle>
              <AlertDescription className="space-y-1">
                {pricingViolations.map((violation) => (
                  <p key={violation} className="text-xs">
                    {violation}
                  </p>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {hasPricingErrors && pricingViolations.length === 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Pricing unavailable</AlertTitle>
              <AlertDescription className="text-xs">
                We’re having trouble fetching nightly rates. Please adjust your selection or try again later.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm">
            <p>
              Selected: {selection.length} of {requestedRooms} room(s)
            </p>
            <p>{nights} night(s)</p>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>
              {isPricingLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                `$${totalCost.toFixed(2)}`
              )}
            </span>
          </div>
          <Button
            className="w-full"
            onClick={handleProceed}
            disabled={proceedDisabled}
          >
            {isSelectionComplete
              ? pricingViolations.length > 0
                ? "Adjust Stay to Proceed"
                : hasPricingErrors
                  ? "Pricing Unavailable"
                  : "Proceed to Book"
              : `Select ${requestedRooms - selection.length} more room(s)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}