"use client";

import * as React from "react";
import {
  notFound,
  useParams,
  useSearchParams,
  useRouter,
} from "next/navigation";
import {
  Users,
  Bed,
  Calendar as CalendarIcon,
  MapPin,
  Star,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  ChevronRight,
  Clock,
  ParkingCircle,
  Info,
  ChevronDown,
  Building,
  TicketPercent,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  differenceInDays,
  formatISO,
  eachDayOfInterval,
  parseISO,
  parse,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useDataContext } from "@/context/data-context";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";
import { Separator } from "@/components/ui/separator";
import type { IconName } from "@/lib/icons";
import { RoomTypeCard } from "@/components/public/room-type-card";

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
  guests: z.coerce.number().min(1, "At least one guest is required."),
});

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
    property,
    reservations,
    roomTypes,
    amenities: allAmenities,
    rooms,
    ratePlans,
  } = useDataContext();
  const roomType = roomTypes.find((rt) => rt.id === params.id);
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    React.useState(false);
  const [isDatesPopoverOpen, setIsDatesPopoverOpen] = React.useState(false);
  const [isGuestsPopoverOpen, setIsGuestsPopoverOpen] = React.useState(false);

  const standardRatePlan =
    ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: searchParams.get("guests")
        ? Number(searchParams.get("guests"))
        : 1,
      dateRange:
        searchParams.get("from") && searchParams.get("to")
          ? {
              from: parse(searchParams.get("from")!, "yyyy-MM-dd", new Date()),
              to: parse(searchParams.get("to")!, "yyyy-MM-dd", new Date()),
            }
          : undefined,
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

  if (!roomType) {
    notFound();
  }

  const relatedRoomTypes = roomTypes.filter((rt) => rt.id !== roomType.id);

  function onSubmit(values: z.infer<typeof bookingSchema>) {
    const query = new URLSearchParams({
      roomTypeId: roomType!.id,
      from: formatISO(values.dateRange.from, { representation: "date" }),
      to: formatISO(values.dateRange.to, { representation: "date" }),
      guests: values.guests.toString(),
      rooms: "1", // This page books one room at a time
    });
    router.push(`/book/review?${query.toString()}`);
  }

  const description = roomType.description;
  const truncatedDescription =
    description.length > 200
      ? description.substring(0, 200) + "..."
      : description;

  return (
    <div className="bg-background">
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
                {/* <CarouselPrevious className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                {/* <CarouselNext className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
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

            <div className="border border-border/50 rounded-xl p-4 bg-card">
              <h2 className="text-xl font-bold font-serif text-foreground mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                {roomType.amenities.map((amenityId) => {
                  const amenity = allAmenities.find((a) => a.id === amenityId);
                  if (!amenity) return null;
                  return (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <Icon
                        name={amenityIcons[amenity.name] || amenity.icon}
                        className="h-5 w-5 text-muted-foreground"
                      />
                      <span>{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-border/50 rounded-xl p-4 bg-card">
              <h2 className="text-xl font-bold font-serif text-foreground mb-6">Ashram Rules</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span>Check In: 3:00 pm</span>
                </div>
                <div className="flex items-center gap-3">
                  <ParkingCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span>Parking Area: 5</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span>Check Out: 12:00 pm</span>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span>Minimum Age to Check In: 17</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 mt-8 lg:mt-0">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
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
                                  disabled={{ before: new Date() }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="pl-2" />
                          </FormItem>
                        )}
                      />
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
                                    <Building className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <label className="text-xs text-muted-foreground">
                                        Guests
                                      </label>
                                      <div className="text-sm font-medium">
                                        1 Room, {field.value} Adult
                                        {field.value > 1 ? "s" : ""}
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
                                className="w-auto p-4"
                                align="end"
                              >
                                <div className="flex items-center justify-between space-x-2.5">
                                  <span className="font-medium">Adults: </span>
                                  <div className="flex items-center">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        field.onChange(
                                          Math.max(1, field.value - 1)
                                        )
                                      }
                                    >
                                      <span className="text-lg">−</span>
                                    </Button>
                                    <span className="w-8 text-center">
                                      {field.value}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        field.onChange(
                                          Math.min(
                                            roomType.maxOccupancy,
                                            field.value + 1
                                          )
                                        )
                                      }
                                    >
                                      <span className="text-lg">+</span>
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="px-3 pb-2" />
                          </FormItem>
                        )}
                      />
                      <div className="p-3">
                        <div className="flex items-center justify-between w-full text-left">
                          <div className="flex items-center gap-3">
                            <TicketPercent className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <label className="text-xs text-muted-foreground">
                                Special Rates
                              </label>
                              <div className="text-sm font-medium">
                                Lowest Regular Rate
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Additional Fees
                      </span>
                      <span className="text-sm font-medium">$0.00</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Pricing
                      </span>
                      <span className="text-sm font-medium">
                        ${standardRatePlan?.price.toFixed(2)} /night
                      </span>
                    </div>

                    <Button
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-4 py-2 w-full"
                      type="submit"
                      disabled={!dateRange?.from || !dateRange?.to}
                    >
                      Reserve
                    </Button>
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