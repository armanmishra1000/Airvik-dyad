"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  areIntervalsOverlapping,
  parseISO,
  eachDayOfInterval,
} from "date-fns";
import { Calendar as CalendarIcon, Users, Search } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-context";
import type { RoomType } from "@/data";

const searchSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  guests: z.coerce.number().min(1, "At least one guest is required."),
});

interface BookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ isOpen, onOpenChange }: BookingDialogProps) {
  const router = useRouter();
  const { reservations, rooms, roomTypes } = useAppContext();
  const [availableRoomTypes, setAvailableRoomTypes] = React.useState<
    RoomType[] | null
  >(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      guests: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    setIsLoading(true);
    setAvailableRoomTypes(null);

    // Simulate network delay
    setTimeout(() => {
      const available = roomTypes.filter((rt) => {
        const roomsOfType = rooms.filter((r) => r.roomTypeId === rt.id);
        const totalRooms = roomsOfType.length;
        if (totalRooms === 0) return false;

        const bookingsCountByDate: { [key: string]: number } = {};
        const relevantReservations = reservations.filter(
          (res) =>
            roomsOfType.some((r) => r.id === res.roomId) &&
            res.status !== "Cancelled" &&
            areIntervalsOverlapping(
              { start: values.dateRange.from, end: values.dateRange.to },
              {
                start: parseISO(res.checkInDate),
                end: parseISO(res.checkOutDate),
              }
            )
        );

        relevantReservations.forEach((res) => {
          const interval = {
            start: parseISO(res.checkInDate),
            end: parseISO(res.checkOutDate),
          };
          const bookingDays = eachDayOfInterval(interval);
          if (bookingDays.length > 0) bookingDays.pop();
          bookingDays.forEach((day) => {
            const dayString = format(day, "yyyy-MM-dd");
            bookingsCountByDate[dayString] =
              (bookingsCountByDate[dayString] || 0) + 1;
          });
        });

        const isAvailable = Object.values(bookingsCountByDate).every(
          (count) => count < totalRooms
        );
        return isAvailable;
      });

      setAvailableRoomTypes(available);
      setIsLoading(false);
    }, 500);
  };

  const handleBookNow = (roomTypeId: string) => {
    const { dateRange } = form.getValues();
    if (!dateRange?.from || !dateRange?.to) return;

    const query = new URLSearchParams({
      from: format(dateRange.from, "yyyy-MM-dd"),
      to: format(dateRange.to, "yyyy-MM-dd"),
    });
    router.push(`/rooms/${roomTypeId}?${query.toString()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book Your Stay</DialogTitle>
          <DialogDescription>
            Select your dates to check for available rooms.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="p-1">
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
                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                    {format(field.value.to, "LLL dd, y")}
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
                        <PopoverContent className="w-auto p-0" align="start">
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
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Check Availability"}
                </Button>
              </form>
            </Form>
          </div>
          <div className="border-l -ml-3 pl-6">
            <h3 className="font-semibold mb-2 text-center">
              Available Rooms
            </h3>
            <ScrollArea className="h-80">
              <div className="space-y-4 pr-4">
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <Search className="h-8 w-8 animate-pulse text-muted-foreground" />
                  </div>
                )}
                {availableRoomTypes && availableRoomTypes.length > 0 && (
                  availableRoomTypes.map((rt) => (
                    <div key={rt.id}>
                      <div className="flex gap-4">
                        <div className="w-24 h-16 relative rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              rt.mainPhotoUrl ||
                              rt.photos[0] ||
                              "/room-placeholder.jpg"
                            }
                            alt={rt.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{rt.name}</h4>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>Up to {rt.maxOccupancy} guests</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleBookNow(rt.id)}
                        >
                          Book
                        </Button>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))
                )}
                {availableRoomTypes && availableRoomTypes.length === 0 && (
                  <div className="text-center text-muted-foreground pt-12">
                    <p>No rooms available for the selected dates.</p>
                  </div>
                )}
                {!availableRoomTypes && !isLoading && (
                  <div className="text-center text-muted-foreground pt-12">
                    <p>Please select dates to see availability.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}