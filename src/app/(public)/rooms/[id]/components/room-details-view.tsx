"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  differenceInDays,
  formatISO,
  parse,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";
import { Users, Bed, Calendar as CalendarIcon } from "lucide-react";
import type { RoomType, Amenity, RatePlan } from "@/data/types";

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email."),
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  guests: z.coerce.number().min(1, "At least one guest is required."),
});

interface RoomDetailsViewProps {
  roomType: RoomType & { amenities: Amenity[] };
  ratePlan: RatePlan;
  disabledDates: Date[];
}

export function RoomDetailsView({ roomType, ratePlan, disabledDates }: RoomDetailsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      guests: searchParams.get("guests")
        ? Number(searchParams.get("guests"))
        : 1,
      dateRange:
        searchParams.get("from") && searchParams.get("to")
          ? {
              from: parse(
                searchParams.get("from")!,
                "yyyy-MM-dd",
                new Date()
              ),
              to: parse(searchParams.get("to")!, "yyyy-MM-dd", new Date()),
            }
          : undefined,
    },
  });

  const dateRange = form.watch("dateRange");
  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;
  const totalCost = nights * ratePlan.price;

  const photosToShow = React.useMemo(() => {
    if (!roomType || !roomType.photos || roomType.photos.length === 0) {
      return ["/room-placeholder.svg"];
    }
    const sortedPhotos = [...roomType.photos];
    if (roomType.mainPhotoUrl) {
      const mainIndex = sortedPhotos.indexOf(roomType.mainPhotoUrl);
      if (mainIndex > -1) {
        sortedPhotos.splice(mainIndex, 1);
        sortedPhotos.unshift(roomType.mainPhotoUrl);
      }
    }
    return sortedPhotos;
  }, [roomType]);

  function onSubmit(values: z.infer<typeof bookingSchema>) {
    const query = new URLSearchParams({
      roomTypeId: roomType!.id,
      from: formatISO(values.dateRange.from, { representation: "date" }),
      to: formatISO(values.dateRange.to, { representation: "date" }),
      guests: values.guests.toString(),
      rooms: "1", // This page books a single room
    });
    router.push(`/book/review?${query.toString()}`);
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Carousel className="w-full rounded-lg overflow-hidden mb-4">
          <CarouselContent>
            {photosToShow.map((photo, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-video">
                  <img
                    src={photo}
                    alt={`${roomType.name} photo ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4" />
          <CarouselNext className="absolute right-4" />
        </Carousel>

        <h1 className="text-4xl font-bold font-serif">{roomType.name}</h1>
        <div className="flex items-center gap-6 text-muted-foreground mt-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Up to {roomType.maxOccupancy} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            <span>{roomType.bedTypes.join(", ")}</span>
          </div>
        </div>
        <p className="text-lg leading-relaxed">{roomType.description}</p>

        {roomType.amenities.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold font-serif mb-4">
              What this room offers
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {roomType.amenities.map((amenity) => (
                <li key={amenity.id} className="flex items-center gap-3">
                  <Icon name={amenity.icon} className="h-5 w-5 text-primary" />
                  <span>{amenity.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Book Your Stay</CardTitle>
            <CardDescription>
              Fill in your details to complete the booking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-in / Check-out</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value?.from && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "LLL dd, y")}{" "}
                                    - {format(field.value.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </FormControl>
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
                            numberOfMonths={1}
                            disabled={[
                              ...disabledDates,
                              { before: new Date() },
                            ]}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Guests</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={roomType.maxOccupancy}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {nights > 0 && (
                  <div className="text-center font-semibold text-lg border-t pt-4">
                    <p>
                      Total for {nights} night(s): ${totalCost.toFixed(2)}
                    </p>
                  </div>
                )}
                <Button className="w-full" type="submit">
                  Proceed to Book
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}