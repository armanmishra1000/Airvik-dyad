"use client";

import * as React from "react";
import { calculateRoomPricing, calculateMultipleRoomPricing } from "@/lib/pricing-calculator";
import { useParams, notFound } from "next/navigation";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  User,
  BedDouble,
  CalendarDays,
  IndianRupee,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useDataContext } from "@/context/data-context";
import { getGuestById, getReservationById } from "@/lib/api";
import type { Guest, Reservation, RoomType } from "@/data/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { property, reservations, guests, rooms, roomTypes, ratePlans } = useDataContext();
  const [reservationData, setReservationData] = React.useState<Reservation | null>(null);
  const [guestData, setGuestData] = React.useState<Guest | null>(null);
  const [isLoadingReservation, setIsLoadingReservation] = React.useState(false);
  const [isLoadingGuest, setIsLoadingGuest] = React.useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false);

  const reservation = reservationData || reservations.find((r) => r.id === params.id);
  const guestFromContext = reservation ? guests.find((g) => g.id === reservation.guestId) : undefined;
  const guest = guestData || guestFromContext;
  
  // Derive all reservations that belong to the same booking
  const bookingReservations = React.useMemo(() => {
    if (!reservation) return [] as Reservation[];
    const grouped = reservations.filter((r) => r.bookingId === reservation.bookingId);
    if (grouped.length > 0) {
      return grouped;
    }
    return [reservation];
  }, [reservation, reservations]);

  // Group booked rooms by room type for display
  type ConfirmedRoomSummary = {
    roomType: RoomType;
    quantity: number;
    guestCount: number;
  };

  const confirmedRoomSummaries: ConfirmedRoomSummary[] = React.useMemo(() => {
    if (bookingReservations.length === 0) return [];

    const byRoomType = new Map<string, ConfirmedRoomSummary>();

    for (const res of bookingReservations) {
      const room = rooms.find((roomItem) => roomItem.id === res.roomId);
      if (!room) continue;
      const roomType = roomTypes.find((rt) => rt.id === room.roomTypeId);
      if (!roomType) continue;

      const existing = byRoomType.get(roomType.id);
      if (existing) {
        existing.quantity += 1;
        existing.guestCount += res.numberOfGuests;
      } else {
        byRoomType.set(roomType.id, {
          roomType,
          quantity: 1,
          guestCount: res.numberOfGuests,
        });
      }
    }

    return Array.from(byRoomType.values());
  }, [bookingReservations, rooms, roomTypes]);

  const totalRooms = React.useMemo(
    () => confirmedRoomSummaries.reduce((sum, item) => sum + item.quantity, 0),
    [confirmedRoomSummaries]
  );

  const totalGuests = React.useMemo(() => {
    if (bookingReservations.length === 0) {
      return 0;
    }

    const currentId = reservation?.id;
    const primaryReservation =
      (currentId
        ? bookingReservations.find((resItem) => resItem.id === currentId)
        : undefined) ?? bookingReservations[0];

    const guests = primaryReservation.numberOfGuests ?? 0;
    return guests > 0 ? guests : 0;
  }, [bookingReservations, reservation?.id]);

  const primaryRoomType = React.useMemo(() => {
    if (confirmedRoomSummaries.length > 0) {
      return confirmedRoomSummaries[0].roomType;
    }

    if (reservation) {
      const room = rooms.find((roomItem) => roomItem.id === reservation.roomId);
      if (room) {
        return roomTypes.find((rt) => rt.id === room.roomTypeId) ?? null;
      }
    }

    return null;
  }, [confirmedRoomSummaries, reservation, rooms, roomTypes]);

  // Calculate nights based on the reservation dates
  const nights = reservation
    ? differenceInDays(
        parseISO(reservation.checkOutDate),
        parseISO(reservation.checkInDate)
      )
    : 0;

  // Determine the rate plan used for this booking
  const bookingRatePlan = React.useMemo(() => {
    if (bookingReservations.length === 0) return null;
    const ratePlanId = bookingReservations[0].ratePlanId;
    return ratePlans.find((rp) => rp.id === ratePlanId) ?? null;
  }, [bookingReservations, ratePlans]);

  const roomLineItems = React.useMemo(
    () =>
      confirmedRoomSummaries.map((item) => {
        const baseNightly =
          typeof item.roomType.price === "number" ? item.roomType.price : 0;
        const lineBase = baseNightly * nights * item.quantity;
        return {
          id: item.roomType.id,
          name: item.roomType.name,
          quantity: item.quantity,
          nights,
          baseNightly,
          lineBase,
        };
      }),
    [confirmedRoomSummaries, nights]
  );

  // Calculate prices using shared utilities for single or multi-room bookings
  const taxConfig = React.useMemo(
    () => ({
      enabled: Boolean(property.tax_enabled),
      percentage: property.tax_percentage ?? 0,
    }),
    [property.tax_enabled, property.tax_percentage]
  );

  const pricing = React.useMemo(() => {
    if (!reservation || nights <= 0) {
      return calculateRoomPricing({ nights: 0, rooms: 0, taxConfig });
    }

    if (totalRooms <= 1) {
      const singleRoomType =
        confirmedRoomSummaries[0]?.roomType ?? primaryRoomType ?? undefined;
      return calculateRoomPricing({
        roomType: singleRoomType,
        ratePlan: bookingRatePlan,
        nights,
        rooms: 1,
        taxConfig,
      });
    }

    const roomTypesForPricing: RoomType[] = [];
    confirmedRoomSummaries.forEach(({ roomType, quantity }) => {
      for (let i = 0; i < quantity; i += 1) {
        roomTypesForPricing.push(roomType);
      }
    });

    return calculateMultipleRoomPricing({
      roomTypes: roomTypesForPricing,
      ratePlan: bookingRatePlan,
      nights,
      taxConfig,
    });
  }, [
    reservation,
    nights,
    totalRooms,
    confirmedRoomSummaries,
    primaryRoomType,
    bookingRatePlan,
    taxConfig,
  ]);

  const formattedTaxRate = pricing.taxRatePercent.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: pricing.taxRatePercent % 1 === 0 ? 0 : 2,
  });
  
  // Fetch reservation directly if not in context
  React.useEffect(() => {
    const reservationId = params.id;
    if (reservationId && !reservation && !reservationData && !isLoadingReservation && !hasAttemptedFetch) {
      setIsLoadingReservation(true);
      setHasAttemptedFetch(true);
      getReservationById(reservationId)
        .then(({ data }) => {
          if (data) {
            setReservationData(data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch reservation:", error);
        })
        .finally(() => {
          setIsLoadingReservation(false);
        });
    }
  }, [params.id, reservation, reservationData, isLoadingReservation, hasAttemptedFetch]);
  
  // Fetch guest directly if not in context
  React.useEffect(() => {
    if (reservation && !guestFromContext && reservation.guestId && !guestData && !isLoadingGuest) {
      setIsLoadingGuest(true);
      getGuestById(reservation.guestId)
        .then(({ data }) => {
          if (data) {
            setGuestData(data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch guest:", error);
        })
        .finally(() => {
          setIsLoadingGuest(false);
        });
    }
  }, [reservation, guestFromContext, guestData, isLoadingGuest]);

  // Show loading state while fetching data
  if (isLoadingReservation || (!reservation && !hasAttemptedFetch)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your reservation...</p>
        </div>
      </div>
    );
  }

  if (!reservation && hasAttemptedFetch && !isLoadingReservation) {
    return notFound();
  }

  // Ensure reservation exists before proceeding
  if (!reservation) {
    return null; // This should not happen due to the check above
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reservation.id);
    toast.success("Reservation ID copied to clipboard!");
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="text-4xl font-bold font-serif text-foreground mt-4">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Thank you, {guest?.firstName}! Your stay at {property.name} is
              booked.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left column: Reservation Details */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-foreground font-serif">Your Reservation</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1">
                    <span>Reservation ID: {reservation.id}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {confirmedRoomSummaries.length > 0 && (
                      <div className="space-y-3">
                        {confirmedRoomSummaries.map((item) => {
                          const capacityPerRoom = item.roomType.maxOccupancy;

                          return (
                            <div
                              key={item.roomType.id}
                              className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3"
                            >
                              <div className="relative h-16 w-24 overflow-hidden rounded flex-shrink-0">
                                <img
                                  src={
                                    item.roomType.mainPhotoUrl ||
                                    item.roomType.photos?.[0] ||
                                    "/room-placeholder.svg"
                                  }
                                  alt={item.roomType.name}
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-base font-medium leading-tight">
                                  {item.roomType.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  x{item.quantity} room
                                  {item.quantity === 1 ? "" : "s"}
                                  {capacityPerRoom
                                    ? ` · up to ${capacityPerRoom} guest${capacityPerRoom === 1 ? "" : "s"} per room`
                                    : ""}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                      <span>
                        Total: {totalRooms} room{totalRooms === 1 ? "" : "s"}
                      </span>
                      <span>
                        · {totalGuests} guest{totalGuests === 1 ? "" : "s"}
                      </span>
                      <span>
                        · {nights} night{nights === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Check-in
                      </h4>
                      <p className="text-lg font-medium">
                        {format(
                          parseISO(reservation.checkInDate),
                          "E, MMM d, yyyy"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        From 12:00 PM
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Check-out
                      </h4>
                      <p className="text-lg font-medium">
                        {format(
                          parseISO(reservation.checkOutDate),
                          "E, MMM d, yyyy"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        before 10:00 AM
                      </p>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Your total price
                    </h4>
                    <div className="space-y-3 text-sm">
                      {roomLineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-xs sm:text-sm"
                        >
                          <span>
                            {item.name} · x{item.quantity} room
                            {item.quantity === 1 ? "" : "s"} · {item.nights} night
                            {item.nights === 1 ? "" : "s"}
                          </span>
                          <span className="font-medium">
                            ₹{Math.round(item.lineBase).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}

                      <Separator className="my-2" />

                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          {pricing.taxesApplied ? "Total (before tax)" : "Subtotal"}
                        </span>
                        <span className="font-semibold">
                          ₹{Math.round(pricing.totalCost).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {pricing.taxesApplied && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">
                            Taxes &amp; fees ({formattedTaxRate}%)
                          </span>
                          <span className="font-semibold">
                            ₹{Math.round(pricing.taxesAndFees).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      <Separator className="my-2" />

                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span>
                          ₹{Math.round(pricing.grandTotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: Hotel Info & What's Next */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-foreground font-serif">Hotel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="font-bold text-base">SAHAJANAND WELLNESS</p>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Street No.12, Shisham Jhadi, Muni Ki Reti, Near Ganga
                      Kinare, Rishikesh U.K Pin Code: 249201
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{property.phone}</span>
                  </div>
                  <div className="aspect-video w-full overflow-hidden rounded-lg border mt-4">
                    <iframe
                      src={property.google_maps_url}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </CardContent>
                <Separator className="my-4" />
                <CardHeader className="pt-0">
                  <CardTitle className="text-foreground font-serif">What&apos;s Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground pt-0">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      A confirmation email has been sent to{" "}
                      <strong className="text-foreground">
                        {guest?.email}
                      </strong>
                      .
                    </span>
                  </div>
                  <p>
                    Please contact us for any special requests or questions
                    about your stay.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" className="h-12 px-10 rounded-lg">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}