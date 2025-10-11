"use client";

import * as React from "react";
import {
  notFound,
  useParams,
  useSearchParams,
  useRouter,
} from "next/navigation";
import {
  Calendar as CalendarIcon,
  MapPin,
  Star,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  Clock,
  ParkingCircle,
  Info,
  ChevronDown,
  Building,
  Users,
  Wifi,
  Shield,
  CheckCircle,
  Sparkles,
  Baby,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, formatISO, eachDayOfInterval, parseISO, parse, addDays, isFriday, differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useDataContext } from "@/context/data-context";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";
import type { IconName } from "@/lib/icons";
import { RoomTypeCard } from "@/components/public/room-type-card";
import { RoomDetailsSkeleton } from "@/components/public/room-details-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const bookingSchema = z.object({
  dateRange: z
    .object({
      from: z.date({ required_error: "Check-in date is required." }),
      to: z.date({ required_error: "Check-out date is required." }),
    })
    .refine((data) => data.from < data.to, {
      message: "Check-out date must be after check-in date.",
      path: ["to"],
    }),
  guests: z.coerce.number().min(1, "At least one adult is required."),
  children: z.coerce.number().min(0),
  specialRequests: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const amenityIcons: Record<string, IconName> = {
  "Free Wi-Fi": "Wifi",
  "Air Conditioning": "AirVent",
  "Flat-screen TV": "Tv",
  "Mini-bar": "Refrigerator",
  "Ocean View": "Waves",
  "Private Balcony": "GalleryVertical",
  "Ensuite Bathroom": "Bath",
  "Room Service": "ConciergeBell",
  "Lounge chairs": "Armchair",
  "Washing Machine": "WashingMachine",
  Refrigerator: "Refrigerator",
  Bedroom: "Bed",
  Oven: "CookingPot",
  Wifi: "Wifi",
  Bathroom: "Bath",
  "Air Conditioner": "AirVent",
  "Swimming Pool": "Waves",
};

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    reservations,
    roomTypes,
    amenities: allAmenities,
    rooms,
    ratePlans,
    isLoading,
  } = useDataContext();
  const roomType = roomTypes.find((rt) => rt.id === params.id);
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    React.useState(false);
  const [isDatesPopoverOpen, setIsDatesPopoverOpen] = React.useState(false);
  const [isGuestsPopoverOpen, setIsGuestsPopoverOpen] = React.useState(false);

  const standardRatePlan =
    ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];

  // Find the next available weekend for default dates
  const getNextWeekend = () => {
    const today = new Date();
    let nextFriday = today;
    
    // Find next Friday
    while (!isFriday(nextFriday) || nextFriday <= today) {
      nextFriday = addDays(nextFriday, 1);
    }
    
    const nextSunday = addDays(nextFriday, 2);
    return { from: nextFriday, to: nextSunday };
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: searchParams.get("guests")
        ? Number(searchParams.get("guests"))
        : 2,
      children: searchParams.get("children")
        ? Number(searchParams.get("children"))
        : 0,
      dateRange:
        searchParams.get("from") && searchParams.get("to")
          ? {
              from: parse(searchParams.get("from")!, "yyyy-MM-dd", new Date()),
              to: parse(searchParams.get("to")!, "yyyy-MM-dd", new Date()),
            }
          : getNextWeekend(),
      specialRequests: "",
    },
  });

  const dateRange = form.watch("dateRange");

  const photosToShow = React.useMemo(() => {
    if (!roomType || !roomType.photos || roomType.photos.length === 0) {
      return [
        "/room-placeholder.svg",
        "/room-placeholder.svg",
        "/room-placeholder.svg",
      ];
    }
    const sortedPhotos = [...roomType.photos];
    if (roomType.mainPhotoUrl) {
      const mainIndex = sortedPhotos.indexOf(roomType.mainPhotoUrl);
      if (mainIndex > -1) {
        sortedPhotos.splice(mainIndex, 1);
        sortedPhotos.unshift(roomType.mainPhotoUrl);
      }
    }
    const paddedPhotos = [...sortedPhotos];
    while (paddedPhotos.length < 3) {
      paddedPhotos.push("/room-placeholder.svg");
    }
    return paddedPhotos;
  }, [roomType]);

  const disabledDates = React.useMemo(() => {
    if (!roomType) return [];
    const roomsOfType = rooms.filter((r) => r.roomTypeId === roomType.id);
    const numberOfRooms = roomsOfType.length;
    if (numberOfRooms === 0) return [{ before: new Date() }];

    const bookingsCountByDate: { [key: string]: number } = {};
    const relevantReservations = reservations.filter(
      (res) =>
        roomsOfType.some((r) => r.id === res.roomId) &&
        res.status !== "Cancelled"
    );

    relevantReservations.forEach((res) => {
      const interval = {
        start: parseISO(res.checkInDate),
        end: parseISO(res.checkOutDate),
      };
      const bookingDays = eachDayOfInterval(interval);
      if (bookingDays.length > 0) bookingDays.pop();

      bookingDays.forEach((day) => {
        const dayString = formatISO(day, { representation: "date" });
        bookingsCountByDate[dayString] =
          (bookingsCountByDate[dayString] || 0) + 1;
      });
    });

    const fullyBookedDates = Object.entries(bookingsCountByDate)
      .filter(([, count]) => count >= numberOfRooms)
      .map(([dateString]) => parseISO(dateString));

    return [{ before: new Date() }, ...fullyBookedDates];
  }, [roomType, reservations, rooms]);

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <RoomDetailsSkeleton />;
  }

  if (!roomType) {
    notFound();
  }

  const relatedRoomTypes = roomTypes.filter((rt) => rt.id !== roomType.id);

  function onSubmit(values: BookingFormValues) {
    const query = new URLSearchParams({
      roomTypeId: roomType!.id,
      from: formatISO(values.dateRange.from, { representation: "date" }),
      to: formatISO(values.dateRange.to, { representation: "date" }),
      guests: values.guests.toString(),
      children: values.children.toString(),
      rooms: "1", // This page books one room at a time
    });
    
    if (values.specialRequests) {
      query.set("specialRequests", values.specialRequests);
    }
    
    router.push(`/book/review?${query.toString()}`);
  }

  const description = roomType.description;
  const truncatedDescription =
    description.length > 200
      ? description.substring(0, 200) + "..."
      : description;

  // Calculate pricing based on selected dates
  const nightCount = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 2;
  const nightlyRate = standardRatePlan?.price || 3000;
  const totalPrice = nightlyRate * nightCount;
  const taxesAndFees = totalPrice * 0.18; // 18% taxes
  const grandTotal = totalPrice + taxesAndFees;

  return (
    <div className="min-h-screen">
      {/* Hero Summary Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {roomType.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-base mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Rishikesh, Uttarakhand</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Up to {roomType.maxOccupancy} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-gray-900">4.8</span>
                  <span className="text-gray-500">(127 reviews)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium border-green-200 bg-green-50 text-green-700">
                  <Wifi className="h-4 w-4 mr-1.5" />
                  Free WiFi
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium border-blue-200 bg-blue-50 text-blue-700">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Sanitized Stay
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium border-green-200 bg-green-50 text-green-700">
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Free Cancellation
                </Badge>
              </div>
            </div>
            
            <div className="lg:text-right bg-gray-50 rounded-xl p-6 min-w-[280px]">
              <div className="mb-4">
                <span className="text-sm text-gray-500 block">from</span>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-4xl font-bold text-primary">₹{nightlyRate.toLocaleString()}</span>
                </div>
                <span className="text-sm text-gray-500">per night</span>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 text-base"
                onClick={() => {
                  const bookingSection = document.getElementById('booking-form');
                  bookingSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-sm font-medium">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          {/* Desktop Grid Gallery */}
          <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[80vh] max-h-[500px] overflow-hidden">
            <div className="md:col-span-2 md:row-span-2 relative">
              <img
                src={photosToShow[0]}
                alt={`${roomType.name} photo 1`}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="md:col-span-2 relative">
              <img
                src={photosToShow[1]}
                alt={`${roomType.name} photo 2`}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="md:col-span-2 relative">
              <img
                src={photosToShow[2]}
                alt={`${roomType.name} photo 3`}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="relative group">
              <Carousel className="w-full">
                <CarouselContent>
                  {photosToShow.map((photo, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`${roomType.name} photo ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-x-12">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="sm:text-3xl text-2xl lg:text-4xl font-bold font-serif text-foreground">
                {roomType.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>Rishikesh, Uttarakhand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-foreground">4.5</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {isDescriptionExpanded ? description : truncatedDescription}
              {description.length > 50 && (
                <Button
                  variant="link"
                  className="p-0 h-auto ml-2"
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                >
                  {isDescriptionExpanded ? "Read Less" : "Read More"}
                </Button>
              )}
            </p>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="space-y-6">
                {/* Essential Amenities */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Essentials</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {roomType.amenities.filter(amenityId => {
                      const amenity = allAmenities.find((a) => a.id === amenityId);
                      return amenity && ['Free Wi-Fi', 'Wifi', 'Air Conditioning', 'Air Conditioner', 'Ensuite Bathroom', 'Bathroom'].includes(amenity.name);
                    }).map((amenityId) => {
                      const amenity = allAmenities.find((a) => a.id === amenityId);
                      if (!amenity) return null;
                      return (
                        <div key={amenity.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon
                              name={amenityIcons[amenity.name] || amenity.icon}
                              className="h-5 w-5 text-primary"
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comfort Amenities */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Comfort</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {roomType.amenities.filter(amenityId => {
                      const amenity = allAmenities.find((a) => a.id === amenityId);
                      return amenity && !['Free Wi-Fi', 'Wifi', 'Air Conditioning', 'Air Conditioner', 'Ensuite Bathroom', 'Bathroom'].includes(amenity.name);
                    }).map((amenityId) => {
                      const amenity = allAmenities.find((a) => a.id === amenityId);
                      if (!amenity) return null;
                      return (
                        <div key={amenity.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Icon
                              name={amenityIcons[amenity.name] || amenity.icon}
                              className="h-5 w-5 text-gray-600"
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ashram Rules</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="checkin" className="border-b">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-left font-medium">Check-in & Check-out</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 pl-8">
                      <div className="text-sm">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="ml-2 font-medium">3:00 PM - 11:00 PM</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="ml-2 font-medium">Before 12:00 PM</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Late check-out may be available upon request
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="age" className="border-b">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-primary" />
                      <span className="text-left font-medium">Age & ID Requirements</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 pl-8 text-sm text-gray-600">
                      <p>Minimum age to check-in: 17 years</p>
                      <p>Valid government-issued photo ID required at check-in</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="parking" className="border-b">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <ParkingCircle className="h-5 w-5 text-primary" />
                      <span className="text-left font-medium">Parking & Transportation</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 pl-8 text-sm text-gray-600">
                      <p>Free parking available (5 spaces)</p>
                      <p>First-come, first-served basis</p>
                      <p>Valet service not available</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className="lg:col-span-2 mt-8 lg:mt-0" id="booking-form">
            <Card className="sticky top-32 shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">from</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">₹{nightlyRate.toLocaleString()}</span>
                      <span className="text-gray-500 font-normal">/night</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold text-gray-900">4.8</span>
                    </div>
                    <p className="text-xs text-gray-500">127 reviews</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="border rounded-lg divide-y divide-border">
                      <FormField
                        control={form.control}
                        name="dateRange"
                        render={({ field }) => (
                          <FormItem>
                            <Popover
                              open={isDatesPopoverOpen}
                              onOpenChange={setIsDatesPopoverOpen}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="flex items-center justify-between w-full p-3 text-left"
                                >
                                  <div className="flex items-center gap-3">
                                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <label className="text-xs text-muted-foreground">
                                        Dates
                                      </label>
                                      <div className="text-sm font-medium">
                                        {field.value?.from && field.value.to ? (
                                          <>
                                            {format(
                                              field.value.from,
                                              "EEE, dd MMM yyyy"
                                            )}{" "}
                                            →{" "}
                                            {format(
                                              field.value.to,
                                              "EEE, dd MMM yyyy"
                                            )}
                                          </>
                                        ) : (
                                          <span>Select your dates</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <ChevronDown
                                    className={cn(
                                      "size-5 text-muted-foreground transition-transform",
                                      isDatesPopoverOpen && "rotate-180"
                                    )}
                                  />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  initialFocus
                                  mode="range"
                                  defaultMonth={field.value?.from}
                                  selected={{
                                    from: field.value?.from,
                                    to: field.value?.to,
                                  }}
                                  onSelect={field.onChange}
                                  numberOfMonths={2}
                                  disabled={disabledDates}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="pl-2" />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-0 divide-x">
                        <FormField
                          control={form.control}
                          name="guests"
                          render={({ field }) => (
                            <FormItem>
                              <Popover
                                open={isGuestsPopoverOpen}
                                onOpenChange={setIsGuestsPopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex items-center justify-between w-full p-3 text-left"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Users className="h-5 w-5 text-muted-foreground" />
                                      <div>
                                        <label className="text-xs text-muted-foreground">
                                          Guests
                                        </label>
                                        <div className="text-sm font-medium">
                                          {field.value} Adult{field.value > 1 ? "s" : ""}
                                          {form.watch("children") > 0 && `, ${form.watch("children")} Child${form.watch("children") > 1 ? "ren" : ""}`}
                                        </div>
                                      </div>
                                    </div>
                                    <ChevronDown
                                      className={cn(
                                        "size-5 text-muted-foreground transition-transform",
                                        isGuestsPopoverOpen && "rotate-180"
                                      )}
                                    />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-80 p-6"
                                  align="end"
                                >
                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium">Adults</p>
                                          <p className="text-xs text-gray-500">Ages 13 or above</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() =>
                                              field.onChange(Math.max(1, field.value - 1))
                                            }
                                            disabled={field.value <= 1}
                                          >
                                            <span className="text-lg">−</span>
                                          </Button>
                                          <span className="w-8 text-center font-medium">
                                            {field.value}
                                          </span>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() =>
                                              field.onChange(Math.min(roomType.maxOccupancy, field.value + 1))
                                            }
                                            disabled={field.value >= roomType.maxOccupancy}
                                          >
                                            <span className="text-lg">+</span>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <FormField
                                      control={form.control}
                                      name="children"
                                      render={({ field: childField }) => (
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="font-medium flex items-center gap-2">
                                                Children
                                                <Baby className="h-4 w-4 text-gray-400" />
                                              </p>
                                              <p className="text-xs text-gray-500">Ages 0-12</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() =>
                                                  childField.onChange(Math.max(0, childField.value - 1))
                                                }
                                                disabled={childField.value <= 0}
                                              >
                                                <span className="text-lg">−</span>
                                              </Button>
                                              <span className="w-8 text-center font-medium">
                                                {childField.value}
                                              </span>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() =>
                                                  childField.onChange(childField.value + 1)
                                                }
                                                disabled={(field.value + childField.value) >= roomType.maxOccupancy}
                                              >
                                                <span className="text-lg">+</span>
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    />
                                  </div>
                                  <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs text-gray-500">
                                      This room can accommodate a maximum of {roomType.maxOccupancy} guests
                                    </p>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="px-3 pb-2" />
                            </FormItem>
                          )}
                        />
                        <div className="p-3">
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <label className="text-xs text-muted-foreground">
                                Rooms
                              </label>
                              <div className="text-sm font-medium">
                                1 Room
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Special Requests */}
                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              Special Requests
                              <span className="text-xs text-gray-500">(Optional)</span>
                            </label>
                            <textarea
                              {...field}
                              placeholder="Any special requests or requirements?"
                              className="w-full min-h-[80px] p-3 border rounded-lg resize-none text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Pricing Breakdown */}
                    {dateRange?.from && dateRange?.to && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">₹{nightlyRate.toLocaleString()} × {nightCount} nights</span>
                          <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Taxes & fees</span>
                          <span className="font-medium">₹{Math.round(taxesAndFees).toLocaleString()}</span>
                        </div>
                        <div className="border-t my-2" />
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary">₹{Math.round(grandTotal).toLocaleString()}</span>
                            <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white"
                      type="submit"
                      disabled={!dateRange?.from || !dateRange?.to}
                    >
                      {!dateRange?.from || !dateRange?.to ? (
                        "Select dates to continue"
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Reserve for ₹{Math.round(grandTotal).toLocaleString()}
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-gray-500">
                      You won&apos;t be charged yet. Review before payment.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedRoomTypes.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold font-serif text-foreground mb-8">Related Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedRoomTypes.slice(0, 3).map((relatedRoomType) => (
                <RoomTypeCard
                  key={relatedRoomType.id}
                  roomType={relatedRoomType}
                  price={relatedRoomType.price}
                  hasSearched={false}
                  onSelect={() => {}}
                  isSelectionComplete={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}