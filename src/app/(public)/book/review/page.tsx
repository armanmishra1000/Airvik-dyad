"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  parse,
  differenceInDays,
  areIntervalsOverlapping,
  parseISO,
} from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import { Bed, Loader2, Moon, Users } from "lucide-react";

import { useDataContext } from "@/context/data-context";
import { getOrCreateGuestByEmail } from "@/lib/api";
import { BookingReviewSkeleton } from "@/components/public/booking-review-skeleton";
import { InlineAlert } from "@/components/public/inline-alert";
import { PaymentTrustBadges } from "@/components/public/payment-trust-badges";
import { BookingPolicies } from "@/components/public/booking-policies";
import { calculateRoomPricing, calculateMultipleRoomPricing } from "@/lib/pricing-calculator";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoomType } from "@/data/types";

const paymentSchema = z.object({
  paymentMethod: z.enum(["card", "property"]),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvc: z.string().optional(),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email."),
  country: z.string({ required_error: "Country is required." }),
  phoneCountryCode: z.string(),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
}).refine(
  (data) => {
    if (data.paymentMethod === "card") {
      return (
        data.cardName &&
        data.cardNumber &&
        data.cardNumber.replace(/\s/g, "").length >= 16 &&
        data.expiryDate &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate) &&
        data.cvc &&
        data.cvc.length >= 3
      );
    }
    return true;
  },
  {
    message: "All card details are required when paying with card",
    path: ["cardNumber"],
  }
);

const DEFAULT_BOOKING_ERROR_MESSAGE =
  "An unexpected error occurred. Please try again or contact support.";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message || DEFAULT_BOOKING_ERROR_MESSAGE;
  }

  if (typeof error === "object" && error !== null) {
    const normalized = error as Record<string, unknown>;
    const candidateKeys: Array<keyof typeof normalized> = [
      "message",
      "details",
      "hint",
    ];

    for (const key of candidateKeys) {
      const value = normalized[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return DEFAULT_BOOKING_ERROR_MESSAGE;
};

function BookingReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    property,
    roomTypes,
    rooms,
    reservations,
    addReservation,
    ratePlans,
    isLoading,
  } = useDataContext();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<{
    type: "availability" | "validation" | "payment";
    message: string;
  } | null>(null);
  const [, setHasAvailabilityConflict] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"card" | "property">("card");
  const [activeRoomTypeId, setActiveRoomTypeId] = React.useState<string | null>(null);

  type SelectedRoomTypeSummary = {
    roomType: RoomType;
    quantity: number;
  };

  const bookingDetails = React.useMemo(() => {
    return {
      roomTypeIds: searchParams.getAll("roomTypeId"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      guests: searchParams.get("guests"),
      rooms: searchParams.get("rooms"),
    };
  }, [searchParams]);

  const selectedRoomTypes = React.useMemo(() => {
    if (!bookingDetails.roomTypeIds) return [];
    return bookingDetails.roomTypeIds
      .map((id) => roomTypes.find((rt) => rt.id === id))
      .filter(Boolean) as RoomType[];
  }, [bookingDetails.roomTypeIds, roomTypes]);

  const groupedRoomTypes: SelectedRoomTypeSummary[] = React.useMemo(() => {
    if (!bookingDetails.roomTypeIds || bookingDetails.roomTypeIds.length === 0) {
      return [];
    }

    const counts = new Map<string, number>();

    for (const id of bookingDetails.roomTypeIds) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    const groups: SelectedRoomTypeSummary[] = [];

    counts.forEach((quantity, roomTypeId) => {
      const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
      if (!roomType) return;
      groups.push({ roomType, quantity });
    });

    return groups;
  }, [bookingDetails.roomTypeIds, roomTypes]);

  const ratePlan =
    ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "card",
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      firstName: "",
      lastName: "",
      email: "",
      country: "India",
      phoneCountryCode: "+91",
      phone: "",
    },
  });

  // Validate query parameters and date range
  const { hasValidParams, hasValidDates, fromDate, toDate, nights } = React.useMemo(() => {
    const basicParamsValid = Boolean(
      bookingDetails.roomTypeIds.length > 0 &&
      bookingDetails.from &&
      bookingDetails.to &&
      bookingDetails.guests
    );
    
    if (!basicParamsValid) {
      return { hasValidParams: false, hasValidDates: false, fromDate: null, toDate: null, nights: 0 };
    }
    
    // Parse dates and validate
    const parsedFromDate = parse(bookingDetails.from!, "yyyy-MM-dd", new Date());
    const parsedToDate = parse(bookingDetails.to!, "yyyy-MM-dd", new Date());
    
    // Check if dates are valid and from < to
    const datesValid = !isNaN(parsedFromDate.getTime()) && !isNaN(parsedToDate.getTime());
    const calculatedNights = datesValid ? differenceInDays(parsedToDate, parsedFromDate) : 0;
    const dateOrderValid = calculatedNights > 0;
    
    return {
      hasValidParams: basicParamsValid,
      hasValidDates: datesValid && dateOrderValid,
      fromDate: parsedFromDate,
      toDate: parsedToDate,
      nights: calculatedNights
    };
  }, [bookingDetails]);

  const totalRooms = React.useMemo(
    () => groupedRoomTypes.reduce((sum, item) => sum + item.quantity, 0),
    [groupedRoomTypes],
  );

  const totalGuests = React.useMemo(() => {
    const guestsParam = bookingDetails.guests;
    const parsed = guestsParam ? Number(guestsParam) : 0;
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 0;
    }
    return parsed;
  }, [bookingDetails.guests]);

  const taxConfig = React.useMemo(
    () => ({
      enabled: Boolean(property.tax_enabled),
      percentage: property.tax_percentage ?? 0,
    }),
    [property.tax_enabled, property.tax_percentage]
  );

  const pricing = React.useMemo(() => {
    if (selectedRoomTypes.length === 1) {
      return calculateRoomPricing({
        roomType: selectedRoomTypes[0],
        ratePlan,
        nights,
        taxConfig,
      });
    } else {
      return calculateMultipleRoomPricing({
        roomTypes: selectedRoomTypes,
        ratePlan,
        nights,
        taxConfig,
      });
    }
  }, [selectedRoomTypes, ratePlan, nights, taxConfig]);

  const primaryRoomType = React.useMemo(() => {
    if (groupedRoomTypes.length > 0) {
      return groupedRoomTypes[0].roomType;
    }
    if (selectedRoomTypes.length > 0) {
      return selectedRoomTypes[0];
    }
    return null;
  }, [groupedRoomTypes, selectedRoomTypes]);

  const activeHeroRoomType = React.useMemo(() => {
    if (activeRoomTypeId) {
      const found = roomTypes.find((rt) => rt.id === activeRoomTypeId);
      if (found) {
        return found;
      }
    }
    return primaryRoomType;
  }, [activeRoomTypeId, primaryRoomType, roomTypes]);

  const roomLineItems = groupedRoomTypes.map(({ roomType, quantity }) => {
    const baseNightly = typeof roomType.price === "number" ? roomType.price : 0;
    const lineBase = baseNightly * nights * quantity;
    return {
      id: roomType.id,
      name: roomType.name,
      quantity,
      nights,
      baseNightly,
      lineBase,
    };
  });
  const formattedTaxRate = pricing.taxRatePercent.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: pricing.taxRatePercent % 1 === 0 ? 0 : 2,
  });

  if (isLoading) {
    return <BookingReviewSkeleton />;
  }

  // Show contact us if no rate plan available
  if (!ratePlan) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <InlineAlert
          variant="warning"
          title="Rate Information Unavailable"
          description="We're currently updating our pricing. Please contact us directly to complete your booking."
        />
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contact Us to Book</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Our team is ready to assist you with your booking.</p>
            <div className="space-y-2">
              <p><strong>Phone:</strong> <a href="tel:+919876543210" className="text-primary hover:underline">+91 98765 43210</a></p>
              <p><strong>Email:</strong> <a href="mailto:reservations@sahajanandwellness.com" className="text-primary hover:underline">reservations@sahajanandwellness.com</a></p>
              <p><strong>Hours:</strong> 9:00 AM - 9:00 PM IST (7 days)</p>
            </div>
            <Button onClick={() => router.push("/book")} className="w-full mt-4">
              Return to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error for invalid parameters or dates
  if (!hasValidParams || !hasValidDates || selectedRoomTypes.length === 0) {
    const errorTitle = !hasValidParams 
      ? "Invalid Booking Details"
      : !hasValidDates 
      ? "Invalid Date Range"
      : "No Rooms Selected";
    
    const errorDescription = !hasValidParams
      ? "Required booking information is missing. Please start a new search with valid dates and room selection."
      : !hasValidDates
      ? "The selected dates are invalid or check-out must be after check-in. Please select a valid date range."
      : "No room types were found for your selection. Please return to search and try again.";
    
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <InlineAlert
          variant="error"
          title={errorTitle}
          description={errorDescription}
          action={{
            label: "Return to Search",
            onClick: () => router.push("/book"),
          }}
        />
      </div>
    );
  }

  // Helper function to format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsProcessing(true);
    setBookingError(null); // Clear previous errors
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find available physical rooms for the selection
      const assignedRoomIds: string[] = [];
      let allRoomsFound = true;

      for (const roomType of selectedRoomTypes) {
        const roomsOfType = rooms.filter((r) => r.roomTypeId === roomType.id);
        const availableRoom = roomsOfType.find((room) => {
          // Check if this physical room is already assigned in this booking
          if (assignedRoomIds.includes(room.id)) return false;

          // Check if this physical room has conflicting reservations
          return !reservations.some(
            (res) =>
              res.roomId === room.id &&
              res.status !== "Cancelled" &&
              areIntervalsOverlapping(
                { start: fromDate!, end: toDate! },
                {
                  start: parseISO(res.checkInDate),
                  end: parseISO(res.checkOutDate),
                }
              )
          );
        });

        if (availableRoom) {
          assignedRoomIds.push(availableRoom.id);
        } else {
          allRoomsFound = false;
          break;
        }
      }

      if (!allRoomsFound) {
        setBookingError({
          type: "availability",
          message: "One or more rooms are no longer available for your selected dates.",
        });
        setHasAvailabilityConflict(true);
        toast.error("Room No Longer Available", {
          description: "Please select alternative dates or return to search.",
        });
        setIsProcessing(false);
        return;
      }

      const { data: guest, error: guestError } = await getOrCreateGuestByEmail({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
      });

      if (guestError || !guest) {
        throw guestError ?? new Error("Could not get or create guest record.");
      }

      const newReservations = await addReservation({
        guestId: guest.id,
        roomIds: assignedRoomIds,
        ratePlanId: ratePlan.id,
        checkInDate: bookingDetails.from!,
        checkOutDate: bookingDetails.to!,
        numberOfGuests: Number(bookingDetails.guests),
        adultCount: Number(bookingDetails.guests ?? "1"),
        childCount: 0,
        status: "Confirmed",
        notes: "Booked via public website.",
        bookingDate: new Date().toISOString(),
        source: "website",
        paymentMethod: paymentMethod === "card" ? "Card on file" : "Not relevant",
      });

      // Redirect to the confirmation page of the first reservation in the group
      router.push(`/book/confirmation/${newReservations[0].id}`);
    } catch (error: unknown) {
      const errorMessage = toErrorMessage(error);
      
      console.error("Booking failed:", error);
      
      setBookingError({
        type: "payment",
        message: errorMessage,
      });
      
      toast.error("Booking Failed", {
        description: errorMessage,
      });
      setIsProcessing(false);
    }
  }

  const handleRetry = () => {
    setBookingError(null);
    setHasAvailabilityConflict(false);
  };

  return (
    <div className="container px-4 mx-auto py-10">
      <h1 className="lg:text-3xl sm:text-2xl text-lg font-bold font-serif mb-2 text-center">
        Review Your Booking
      </h1>

      {/* Show error alerts */}
      {bookingError && (
        <div className="max-w-7xl mx-auto mb-6">
          <InlineAlert
            variant="error"
            title={bookingError.type === "availability" ? "Room Unavailable" : "Booking Failed"}
            description={bookingError.message}
            action={{
              label: "Try Again",
              onClick: handleRetry,
            }}
            onDismiss={() => setBookingError(null)}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
        {/* Booking Summary - Sidebar */}
        <div className="space-y-6 md:w-2/5 w-full">
          <Card>
            <CardContent className="p-0">
              <div className="relative h-52 w-full">
                <Image
                  src={
                    activeHeroRoomType?.mainPhotoUrl ||
                    activeHeroRoomType?.photos?.[0] ||
                    "/room-placeholder.svg"
                  }
                  alt={activeHeroRoomType?.name || property.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>

              <div className="px-4 py-4 space-y-3">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    {activeHeroRoomType?.name || primaryRoomType?.name || "Your stay"}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-primary">
                  <div className="inline-flex gap-2 items-center rounded-full border border-border/60 bg-background px-3 py-1.5">
                    <Bed className="h-4 w-4" />
                    <span>
                      {totalRooms} room{totalRooms === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="inline-flex gap-2 items-center rounded-full border border-border/60 bg-background px-3 py-1.5">
                    <Users className="h-4 w-4" />
                    <span>
                      {bookingDetails.guests || "0"} guest
                      {parseInt(bookingDetails.guests || "0", 10) > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="inline-flex gap-2 items-center rounded-full border border-border/60 bg-background px-3 py-1.5">
                    <Moon className="h-4 w-4" />
                    <span className="font-medium">{nights} night{nights === 1 ? "" : "s"}</span>
                  </div>
                </div>
                {groupedRoomTypes.length > 1 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {groupedRoomTypes.map(({ roomType, quantity }) => {
                      const isActive =
                        activeHeroRoomType?.id
                          ? activeHeroRoomType.id === roomType.id
                          : primaryRoomType?.id === roomType.id;

                      return (
                        <button
                          key={roomType.id}
                          type="button"
                          onClick={() => setActiveRoomTypeId(roomType.id)}
                          className={`flex w-[140px] flex-col rounded-md border bg-card/80 p-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                            isActive
                              ? "border-primary ring-1 ring-primary/60 bg-primary/5"
                              : "border-border/60"
                          }`}
                        >
                          <div className="relative mb-2 h-16 w-full overflow-hidden rounded">
                            <Image
                              src={
                                roomType.mainPhotoUrl ||
                                roomType.photos?.[0] ||
                                "/room-placeholder.svg"
                              }
                              alt={roomType.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="truncate text-sm font-medium">{roomType.name}</p>
                          <p className="text-xs text-primary">x{quantity}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {groupedRoomTypes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No rooms selected. Please return to the previous step and
                  select at least one room.
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {groupedRoomTypes.map(({ roomType, quantity }) => {
                      const amenities: string[] = [];
                      const primaryBedType = roomType.bedTypes?.[0];
                      if (primaryBedType) {
                        amenities.push(primaryBedType);
                      }
                      const visibleAmenities = amenities.slice(0, 3);

                      return (
                        <div
                          key={roomType.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card p-3"
                        >
                          <div className="space-y-1">
                            <p className="text-base font-medium leading-tight">
                              {roomType.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Sleeps up to {roomType.maxOccupancy} guest
                              {roomType.maxOccupancy === 1 ? "" : "s"} per room
                            </p>
                            {visibleAmenities.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {visibleAmenities.join(" · ")}
                              </p>
                            )}
                            {typeof roomType.price === "number" && (
                              <p className="text-sm text-muted-foreground">
                                From ₹{Math.round(roomType.price).toLocaleString("en-IN")} per night
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-sm font-medium text-primary">
                              x{quantity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="my-3" />
                  <p className="text-base font-semibold">
                    Total: {totalRooms} room{totalRooms === 1 ? "" : "s"}
                    {totalGuests > 0 && (
                      <> · {totalGuests} guest{totalGuests === 1 ? "" : "s"}</>
                    )}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your booking details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between space-x-4">
                <div>
                  <p className="font-semibold">Check-in</p>
                  <p className="text-sm">
                    {format(fromDate!, "E, d MMM yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">From 12:00 PM</p>
                </div>
                <Separator orientation="vertical" className="h-auto" />
                <div>
                  <p className="font-semibold">Check-out</p>
                  <p className="text-sm">{format(toDate!, "E, d MMM yyyy")}</p>
                  <p className="text-sm text-muted-foreground">Before 10:00 AM</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-semibold">Total length of stay:</p>
                <p className="text-sm">
                  {nights} night{nights > 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-xl">Your total</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pricing.taxesApplied
                    ? "Includes taxes and fees. Prices in INR."
                    : "Prices in INR."}
                </p>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Guest & Payment Information */}
        <div className="md:w-3/5 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Guest & Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Guest Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country/region</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="United States">
                                  United States
                                </SelectItem>
                                <SelectItem value="United Kingdom">
                                  United Kingdom
                                </SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone number</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name="phoneCountryCode"
                                render={({ field: codeField }) => (
                                  <Select
                                    value={codeField.value}
                                    onValueChange={codeField.onChange}
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Code" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="+91">IN +91</SelectItem>
                                      <SelectItem value="+1">US +1</SelectItem>
                                      <SelectItem value="+44">UK +44</SelectItem>
                                      <SelectItem value="+61">AU +61</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="Your phone number"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Separator />
                  
                  {/* Payment Method Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Method</h3>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setPaymentMethod(value as "card" | "property");
                              }}
                              className="grid grid-cols-2 gap-4"
                            >
                              <Label
                                htmlFor="card"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                              >
                                <RadioGroupItem value="card" id="card" className="sr-only" />
                                <div className="space-y-1 text-center">
                                  <p className="text-sm font-medium leading-none">Pay Now</p>
                                  <p className="text-xs text-muted-foreground">Credit/Debit Card</p>
                                </div>
                              </Label>
                              <Label
                                htmlFor="property"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                              >
                                <RadioGroupItem value="property" id="property" className="sr-only" />
                                <div className="space-y-1 text-center">
                                  <p className="text-sm font-medium leading-none">Pay at Property</p>
                                  <p className="text-xs text-muted-foreground">Cash or Card</p>
                                </div>
                              </Label>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Card Details - Show only if Pay Now selected */}
                  {paymentMethod === "card" && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Card Details</h3>
                        <PaymentTrustBadges />
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name on Card</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="•••• •••• •••• ••••"
                              {...field}
                              onChange={(e) => {
                                const formatted = formatCardNumber(e.target.value);
                                field.onChange(formatted);
                              }}
                              maxLength={19}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input placeholder="•••" {...field} maxLength={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                      </div>
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full text-lg rounded-lg h-12"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : paymentMethod === "card" ? (
                      `Confirm & Pay ₹${Math.round(pricing.grandTotal).toLocaleString('en-IN')}`
                    ) : (
                      `Confirm Booking - Pay ₹${Math.round(pricing.grandTotal).toLocaleString('en-IN')} at Property`
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    {paymentMethod === "card"
                      ? "You will be charged immediately. Secure payment powered by SSL encryption."
                      : "You can pay cash or card when you arrive at the property. Your booking will be confirmed instantly."}
                  </p>
                </form>
              </Form>
              
              {/* Policies Accordion */}
              <BookingPolicies />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingReviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <BookingReviewContent />
    </React.Suspense>
  );
}


