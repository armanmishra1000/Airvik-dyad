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
import { ThumbsUp, Loader2 } from "lucide-react";

import { useDataContext } from "@/context/data-context";
import { BookingReviewSkeleton } from "@/components/public/booking-review-skeleton";
import { InlineAlert } from "@/components/public/inline-alert";
import { PaymentTrustBadges } from "@/components/public/payment-trust-badges";
import { BookingPolicies } from "@/components/public/booking-policies";

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

function BookingReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    property,
    roomTypes,
    rooms,
    reservations,
    addGuest,
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

  // At this point, fromDate, toDate, and nights are guaranteed to be valid
  const totalCost = selectedRoomTypes.length * nights * (ratePlan?.price || 0);
  const firstRoomType = selectedRoomTypes[0];

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

      const newGuest = await addGuest({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
      });

      const newReservations = await addReservation({
        guestId: newGuest.id,
        roomIds: assignedRoomIds,
        ratePlanId: ratePlan.id,
        checkInDate: bookingDetails.from!,
        checkOutDate: bookingDetails.to!,
        numberOfGuests: Number(bookingDetails.guests),
        status: "Confirmed",
        notes: "Booked via public website.",
        bookingDate: new Date().toISOString(),
        source: "website",
      });

      // Redirect to the confirmation page of the first reservation in the group
      router.push(`/book/confirmation/${newReservations[0].id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again or contact support.";
      
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
      <h1 className="lg:text-3xl sm:text-2xl text-lg font-bold font-serif mb-6 text-center">
        Review Your Booking
      </h1>

      {/* Show error alerts */}
      {bookingError && (
        <div className="max-w-6xl mx-auto mb-6">
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

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Booking Summary - Right Side */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative h-52 w-full">
                {/* room image */}
                <Image
                  src={
                    firstRoomType?.mainPhotoUrl ||
                    firstRoomType?.photos?.[0] ||
                    "/room-placeholder.svg"
                  }
                  alt={firstRoomType?.name || property.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary p-1 rounded-md">
                    <ThumbsUp className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">SAHAJANAND WELLNESS</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Address: Gali No- 13, shisham jhadi, Chandreshwar Nagar,
                  Rishikesh, Uttarakhand 249137
                </p>
              </div>
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
                  <p className="text-base">
                    {format(fromDate!, "E, d MMM yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">From 12:00</p>
                </div>
                <Separator orientation="vertical" className="h-auto" />
                <div>
                  <p className="font-semibold">Check-out</p>
                  <p className="text-base">{format(toDate!, "E, d MMM yyyy")}</p>
                  <p className="text-sm text-muted-foreground">Until 11:00</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-semibold">Total length of stay:</p>
                <p className="text-lg">
                  {nights} night{nights > 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="font-semibold mb-2">Price details</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {nights} night{nights > 1 ? "s" : ""} x $
                    {ratePlan?.price.toFixed(2)}
                  </span>
                  <span className="font-medium">
                    ${(nights * (ratePlan?.price || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Free</span>
                  <span className="font-medium">$0</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total (INR)</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guest & Payment Information  - Left Side */}
        <div className="md:col-span-2">
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
                      `Confirm & Pay ₹${totalCost.toLocaleString()}`
                    ) : (
                      `Confirm Booking - Pay ₹${totalCost.toLocaleString()} at Property`
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


