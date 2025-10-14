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
  ArrowLeft,
  Clock,
  ParkingCircle,
  Info,
  ChevronDown,
  Building,
  Users,
  Images,
  Minus,
  Plus,
  Sparkles,
  Baby,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, formatISO, eachDayOfInterval, parseISO, parse, addDays, isFriday, differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useDataContext } from "@/context/data-context";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";
import type { IconName } from "@/lib/icons";
import { RoomTypeCard } from "@/components/public/room-type-card";
import { RoomDetailsSkeleton } from "@/components/public/room-details-skeleton";
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
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [mobileCarouselApi, setMobileCarouselApi] = React.useState<CarouselApi | null>(null);
  const [mobileSlideIndex, setMobileSlideIndex] = React.useState(0);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [shareCopied, setShareCopied] = React.useState(false);

  React.useEffect(() => {
    if (!mobileCarouselApi) return;

    const handleSelect = () => {
      setMobileSlideIndex(mobileCarouselApi.selectedScrollSnap());
    };

    handleSelect();
    mobileCarouselApi.on("select", handleSelect);

    return () => {
      mobileCarouselApi.off("select", handleSelect);
    };
  }, [mobileCarouselApi]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  React.useEffect(() => {
    if (!shareCopied) return;

    const timeout = window.setTimeout(() => setShareCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [shareCopied]);

  React.useEffect(() => {
    if (!isGalleryOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isGalleryOpen]);

  const handleShare = React.useCallback(async () => {
    if (typeof window === "undefined") return;

    const shareData = {
      title: roomType?.name ?? "Room details",
      text: roomType?.description ?? "",
      url: window.location.href,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        return;
      }
    } catch {
      // Ignore clipboard errors and fall back to manual copy prompt
    }

    window.prompt("Copy this link", window.location.href);
  }, [roomType?.description, roomType?.name]);

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
      return Array(5).fill("/room-placeholder.svg");
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
    while (paddedPhotos.length < 5) {
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

  const galleryPhotos =
    roomType.photos && roomType.photos.length > 0
      ? roomType.photos
      : photosToShow;
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
      {/* <div className="bg-white border-b">
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
      </div> */}

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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {roomType.name}
              </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share room details</span>
            </Button>
            {shareCopied && (
              <span className="text-xs font-semibold text-muted-foreground">
                Link copied
              </span>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          {/* Desktop Grid Gallery */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-3 rounded-3xl overflow-hidden relative h-[360px]">
            <div className="row-span-2">
              <img
                src={photosToShow[0]}
                alt={`${roomType.name} photo 1`}
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
              {photosToShow.slice(1, 3).map((photo, index) => (
                <img
                  key={`top-${index}`}
                  src={photo}
                  alt={`${roomType.name} photo ${index + 2}`}
                  className="h-[174px] w-full object-cover rounded-2xl"
                />
              ))}
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
              {photosToShow.slice(3, 5).map((photo, index) => (
                <img
                  key={`bottom-${index}`}
                  src={photo}
                  alt={`${roomType.name} photo ${index + 4}`}
                  className="h-[174px] w-full object-cover rounded-2xl"
                />
              ))}
            </div>
            <button
              type="button"
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-lg"
              onClick={() => setIsGalleryOpen(true)}
            >
              <Images className="h-4 w-4" />
              Show all photos
            </button>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="relative group">
              <Carousel className="w-full" setApi={setMobileCarouselApi}>
                <CarouselContent>
                  {galleryPhotos.map((photo, index) => (
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
              {galleryPhotos.length > 0 && (
                <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white md:hidden">
                  {mobileSlideIndex + 1} / {galleryPhotos.length}
                </div>
              )}
              {galleryPhotos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 md:hidden">
                  {galleryPhotos.map((_, dotIndex) => (
                    <span
                      key={dotIndex}
                      className={cn(
                        "h-2 w-2 rounded-full bg-white/40 transition",
                        mobileSlideIndex === dotIndex && "bg-white"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-x-12">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="sm:text-2xl text-2xl lg:text-3xl font-bold font-serif text-foreground">
                {roomType.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>Rishikesh, Uttarakhand</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Up to {roomType.maxOccupancy} guests</span>
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

            <div className="border-t border-border my-6" />

            <div className="bg-white ">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="space-y-6">
                {/* Essential Amenities */}
                <div>
                  {/* <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Essentials</h3> */}
                  <div className="grid grid-cols-2 gap-4">
                    {roomType.amenities.filter(amenityId => {
                      const amenity = allAmenities.find((a) => a.id === amenityId);
                      return amenity && ['Free Wi-Fi', 'Wifi', 'Air Conditioning', 'Air Conditioner', 'Ensuite Bathroom', 'Bathroom'].includes(amenity.name);
                    }).map((amenityId) => {
                      const amenity = allAmenities.find((a) => a.id === amenityId);
                      if (!amenity) return null;
                      return (
                        <div key={amenity.id} className="flex items-center gap-3">
                          <Icon
                            name={amenityIcons[amenity.name] || amenity.icon}
                            className="h-5 w-5 text-gray-700"
                          />
                          <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comfort Amenities */}
                <div className="mt-0 !mt-4">
                  {/* <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Comfort</h3> */}
                  <div className="grid grid-cols-2 gap-4">
                    {roomType.amenities.filter(amenityId => {
                      const amenity = allAmenities.find((a) => a.id === amenityId);
                      return amenity && !['Free Wi-Fi', 'Wifi', 'Air Conditioning', 'Air Conditioner', 'Ensuite Bathroom', 'Bathroom'].includes(amenity.name);
                    }).map((amenityId) => {
                      const amenity = allAmenities.find((a) => a.id === amenityId);
                      if (!amenity) return null;
                      return (
                        <div key={amenity.id} className="flex items-center gap-3">
                          <Icon
                            name={amenityIcons[amenity.name] || amenity.icon}
                            className="h-5 w-5 text-gray-700"
                          />
                          <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-border my-6" />

            <div className="bg-white">
              <h2 className="text-2xl font-bold text-gray-900 ">Ashram Rules</h2>
              <Accordion type="single" collapsible className="w-full p-4">
                <AccordionItem value="checkin" className="border-b">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 " />
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
                      <Info className="h-5 w-5" />
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
                      <ParkingCircle className="h-5 w-5" />
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

          <div
            className={cn(
              "lg:col-span-2 mt-8 lg:mt-0 lg:self-start",
              isGalleryOpen && "pointer-events-none opacity-0"
            )}
            id="booking-form"
          >
            <Card className="sticky top-32 rounded-xl shadow-xl bg-white">
              <CardHeader className="p-6 pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    {/* <p className="text-xs uppercase tracking-wide text-muted-foreground">From</p> */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold text-foreground">₹{nightlyRate.toLocaleString()}</span>
                      <span className="lg:text-lg text-sm text-muted-foreground">for per night</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold text-foreground">4.8</span>
                    </div>
                    <p className="text-xs text-muted-foreground">127 reviews</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="rounded-xl border border-border/50 bg-white overflow-hidden">
                      <div className="border-b">
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
                                  <FormControl>
                                    <button
                                      type="button"
                                      className="w-full px-4 py-4 flex  gap-3 bg-transparent  md:flex-row md:items-center md:justify-between md:text-left"
                                    >
                                      <div className="flex items-center gap-3 justify-center md:justify-start">
                                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex flex-col text-start md:text-left">
                                          <span className="text-xs uppercase tracking-wide text-muted-foreground">Dates</span>
                                          {field.value?.from ? (
                                            field.value?.to ? (
                                              <span className="text-sm font-medium">
                                                {format(field.value.from, "MMM dd, yyyy")} → {format(field.value.to, "MMM dd, yyyy")}
                                              </span>
                                            ) : (
                                              <span className="text-sm font-medium text-muted-foreground">
                                                {format(field.value.from, "MMM dd, yyyy")}
                                              </span>
                                            )
                                          ) : (
                                            <span className="text-sm font-medium text-muted-foreground/70">
                                              Add your travel dates
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="center"
                                  sideOffset={16}
                                  className="w-[min(90vw,640px)] md:w-full md:max-w-none rounded-2xl border border-border/30 bg-white shadow-xl px-4 py-4 md:px-5 md:py-4 max-h-[80vh] overflow-y-auto"
                                >
                                  <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={field.value?.from ?? new Date()}
                                    selected={{
                                      from: field.value?.from,
                                      to: field.value?.to,
                                    }}
                                    onSelect={field.onChange}
                                    numberOfMonths={isMobileViewport ? 1 : 2}
                                    disabled={disabledDates}
                                    className="pt-3 pb-4 md:pt-4 md:pb-5 px-1 md:px-5"
                                    classNames={{
                                      months: "flex flex-col gap-6 sm:flex-row sm:gap-6",
                                      month: "space-y-4",
                                      caption: "flex items-center justify-between",
                                      caption_label: "text-base font-semibold text-foreground",
                                      nav: "flex items-center gap-2",
                                      nav_button: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                                      nav_button_previous: "order-1",
                                      nav_button_next: "order-2",
                                      table: "w-full border-collapse",
                                      head_row: "flex w-full",
                                      head_cell: "flex h-11 w-11 items-center justify-center text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground/70",
                                      row: "mt-1 flex w-full",
                                      cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                                      day: "inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:border-primary/50 focus-visible:bg-primary/5 aria-selected:hover:bg-primary aria-selected:hover:border-primary",
                                      day_selected: "inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground border border-primary",
                                      day_today: "inline-flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-border/60 text-foreground",
                                      day_range_start: "inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground border border-primary",
                                      day_range_end: "inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground border border-primary",
                                      day_range_middle: "inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-foreground aria-selected:!text-foreground border border-primary/20",
                                      day_outside: "pointer-events-none opacity-0 select-none",
                                      day_disabled: "opacity-40 text-muted-foreground hover:border-transparent hover:bg-transparent",
                                      day_hidden: "invisible",
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="px-4 pt-1" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex divide-x flex-col md:flex-row lg:flex-row">
                        <FormField
                          control={form.control}
                          name="guests"
                          render={({ field: guestsField }) => {
                            const childrenCount = form.watch("children");
                            const totalGuests = guestsField.value + childrenCount;
                            return (
                              <FormItem className="flex-1">
                                <Popover
                                  open={isGuestsPopoverOpen}
                                  onOpenChange={setIsGuestsPopoverOpen}
                                >
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="w-full px-4 py-4 flex justify-between gap-3 bg-transparent  md:flex-row md:items-center md:justify-between md:text-left"
                                    >
                                      <div className="flex items-center gap-3 justify-start md:justify-start">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex flex-col text-start md:text-left">
                                          <span className="text-xs uppercase tracking-wide text-[#8C7E6E]">Guests</span>
                                          <span className="text-sm font-medium text-[#3D372F]">
                                            1 room, {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
                                          </span>
                                        </div>
                                      </div>
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="center"
                                    className="w-[min(90vw,420px)] sm:w-[380px] rounded-3xl border border-border/30 bg-white shadow-xl p-6 space-y-6"
                                  >
                                    <div className="space-y-1">
                                      <h4 className="text-lg font-semibold text-foreground">Select occupancy</h4>
                                      <p className="text-sm text-muted-foreground">Choose guests for this stay</p>
                                    </div>
                                    <div className="divide-y divide-border/20">
                                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Users className="h-4 w-4" />
                                          </div>
                                          <div>
                                            <span className="block text-base font-medium text-foreground">Adults</span>
                                            <span className="block text-xs text-muted-foreground">Ages 13 or above</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full border border-border/50 text-foreground transition hover:border-primary hover:text-primary disabled:border-border/30 disabled:text-border"
                                            onClick={() => guestsField.onChange(Math.max(1, guestsField.value - 1))}
                                            disabled={guestsField.value <= 1}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <span className="w-9 text-center text-base font-semibold text-foreground">
                                            {guestsField.value}
                                          </span>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full border border-border/50 text-foreground transition hover:border-primary hover:text-primary disabled:border-border/30 disabled:text-border"
                                            onClick={() =>
                                              guestsField.onChange(
                                                Math.min(roomType.maxOccupancy, guestsField.value + 1)
                                              )
                                            }
                                            disabled={guestsField.value >= roomType.maxOccupancy}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <FormField
                                        control={form.control}
                                        name="children"
                                        render={({ field: childField }) => (
                                          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <Baby className="h-4 w-4" />
                                              </div>
                                              <div>
                                                <span className="block text-base font-medium text-foreground">Children</span>
                                                <span className="block text-xs text-muted-foreground">Ages 0-12</span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-full border border-border/50 text-foreground transition hover:border-primary hover:text-primary disabled:border-border/30 disabled:text-border"
                                                onClick={() => childField.onChange(Math.max(0, childField.value - 1))}
                                                disabled={childField.value <= 0}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </Button>
                                              <span className="w-9 text-center text-base font-semibold text-foreground">
                                                {childField.value}
                                              </span>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-full border border-border/50 text-foreground transition hover:border-primary hover:text-primary disabled:border-border/30 disabled:text-border"
                                                onClick={() => childField.onChange(childField.value + 1)}
                                                disabled={(guestsField.value + childField.value) >= roomType.maxOccupancy}
                                              >
                                                <Plus className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      />
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="sr-only" />
                              </FormItem>
                            );
                          }}
                        />
                        <div className="flex flex-1 items-center justify-between px-4 py-4 border-t md:border-t-0 lg:border-t-0">
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">Rooms</span>
                              <span className="text-sm font-medium block">1 Room</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/50" />

                    {/* Special Requests */}
                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                              Special Requests
                              <span className="text-xs text-muted-foreground">(Optional)</span>
                            </label>
                            <textarea
                              {...field}
                              placeholder="Any special requests or requirements?"
                              className="w-full min-h-[80px] p-3 border border-border/50 rounded-xl resize-none text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white focus-visible:outline-none"
                            />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="border-t border-border/50" />

                    {/* Pricing Breakdown */}
                    {dateRange?.from && dateRange?.to && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">₹{nightlyRate.toLocaleString()} × {nightCount} nights</span>
                          <span className="font-medium text-foreground">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taxes & fees</span>
                          <span className="font-medium text-foreground">₹{Math.round(taxesAndFees).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border/50" />
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-foreground">Total</span>
                          <div className="text-right">
                            <span className="text-2xl font-semibold text-primary">₹{Math.round(grandTotal).toLocaleString()}</span>
                            <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border/50" />

                    <Button
                      className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
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

                    <p className="text-xs text-center text-muted-foreground">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedRoomTypes.slice(0, 4).map((relatedRoomType) => (
                <RoomTypeCard
                  key={relatedRoomType.id}
                  roomType={relatedRoomType}
                  price={relatedRoomType.price}
                  hasSearched={false}
                  onSelect={() => { }}
                  isSelectionComplete={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isGalleryOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <div className="relative w-full max-w-5xl">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="fixed top-6 right-6 z-[130] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-lg hover:bg-white"
                onClick={() => setIsGalleryOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close gallery</span>
              </Button>
              <Carousel className="relative w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {galleryPhotos.map((photo, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full md:w-[90%] lg:w-full mx-auto overflow-hidden rounded-3xl bg-black">
                        <img
                          src={photo}
                          alt={`${roomType.name} gallery photo ${index + 1}`}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  variant="secondary"
                  className="hidden md:flex !left-[-56px] top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg hover:bg-white"
                />
                <CarouselNext
                  variant="secondary"
                  className="hidden md:flex !right-[-56px] top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg hover:bg-white"
                />
              </Carousel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}