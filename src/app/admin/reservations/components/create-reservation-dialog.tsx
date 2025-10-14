"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  formatISO,
  parseISO,
  areIntervalsOverlapping,
} from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDataContext } from "@/context/data-context";
import { priceStay, type PricingResult } from "@/lib/pricing-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const reservationSchema = z.object({
  guestId: z.string({ required_error: "Please select a guest." }),
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  roomId: z.string().min(1, "Please select a room."),
  numberOfGuests: z.coerce
    .number()
    .min(1, "At least one guest is required."),
});

export function CreateReservationDialog() {
  const [open, setOpen] = React.useState(false);
  const { reservations, addReservation, guests, rooms, ratePlans, roomTypes } = useDataContext();
  const form = useForm<z.infer<typeof reservationSchema>>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      numberOfGuests: 1,
      roomId: "",
    },
  });

  const selectedDateRange = form.watch("dateRange");
  const selectedRoomId = form.watch("roomId");

  const resolvedRatePlan = React.useMemo(() => {
    return (
      ratePlans.find((rp) => rp.name === "Standard Rate") ?? ratePlans[0] ?? null
    );
  }, [ratePlans]);

  type PricingState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; error: string }
    | {
        status: "success";
        data: PricingResult;
        roomTypeId: string;
        ratePlanId: string;
      };

  const [pricingState, setPricingState] = React.useState<PricingState>({ status: "idle" });

  const formattedDateRange = React.useMemo(() => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) {
      return null;
    }
    return {
      from: format(selectedDateRange.from, "yyyy-MM-dd"),
      to: format(selectedDateRange.to, "yyyy-MM-dd"),
    };
  }, [selectedDateRange]);

  const availableRooms = React.useMemo(() => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) {
      return [];
    }

    return rooms.filter((room) => {
      const isBooked = reservations.some(
        (res) =>
          res.roomId === room.id &&
          res.status !== "Cancelled" &&
          areIntervalsOverlapping(
            { start: selectedDateRange.from!, end: selectedDateRange.to! },
            { start: parseISO(res.checkInDate), end: parseISO(res.checkOutDate) }
          )
      );
      return !isBooked;
    });
  }, [selectedDateRange, reservations, rooms]);

  React.useEffect(() => {
    form.resetField("roomId");
  }, [selectedDateRange, form]);

  React.useEffect(() => {
    if (!selectedRoomId || !formattedDateRange) {
      setPricingState({ status: "idle" });
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) {
      setPricingState({ status: "error", error: "Selected room not found." });
      return;
    }

    const roomType = roomTypes.find((rt) => rt.id === room.roomTypeId);
    if (!roomType) {
      setPricingState({ status: "error", error: "Room type not found for selected room." });
      return;
    }

    if (!resolvedRatePlan) {
      setPricingState({ status: "error", error: "No rate plan available." });
      return;
    }

    const { from, to } = formattedDateRange;
    if (from >= to) {
      setPricingState({ status: "error", error: "Check-out must be after check-in." });
      return;
    }

    let isCancelled = false;
    setPricingState({ status: "loading" });

    priceStay(roomType.id, resolvedRatePlan.id, from, to)
      .then((result) => {
        if (isCancelled) return;
        setPricingState({
          status: "success",
          data: result,
          roomTypeId: roomType.id,
          ratePlanId: resolvedRatePlan.id,
        });
      })
      .catch((error) => {
        if (isCancelled) return;
        setPricingState({
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to retrieve nightly pricing.",
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [formattedDateRange, resolvedRatePlan, rooms, roomTypes, selectedRoomId]);

  const pricingViolations =
    pricingState.status === "success" ? pricingState.data.violations : [];
  const pricingTotal =
    pricingState.status === "success" ? pricingState.data.total : null;

  async function onSubmit(values: z.infer<typeof reservationSchema>) {
    const ratePlan =
      ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];

    if (!ratePlan) {
      toast.error("No rate plan available for reservation.");
      return;
    }

    if (pricingState.status === "loading") {
      toast.error("Pricing still being calculated. Please wait.");
      return;
    }

    if (pricingState.status === "error") {
      toast.error("Pricing unavailable", {
        description: pricingState.error,
      });
      return;
    }

    if (pricingState.status !== "success") {
      toast.error(
        "Select a room and valid dates to calculate pricing before saving."
      );
      return;
    }

    if (pricingState.data.violations.length > 0) {
      toast.error("Stay violates pricing rules", {
        description: pricingState.data.violations.join("\n"),
      });
      return;
    }

    try {
      await addReservation({
        guestId: values.guestId,
        roomIds: [values.roomId],
        ratePlanId: ratePlan.id,
        checkInDate: formatISO(values.dateRange.from, {
          representation: "date",
        }),
        checkOutDate: formatISO(values.dateRange.to, { representation: "date" }),
        numberOfGuests: values.numberOfGuests,
        status: "Confirmed",
        bookingDate: formatISO(new Date()),
        source: 'reception',
        computedTotal: pricingState.data.total,
      });
      toast.success(`Room booked successfully!`);
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create reservation", {
        description: (error as Error).message,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Reservation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Reservation</DialogTitle>
          <DialogDescription>
            Fill in the details for the new booking.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="guestId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a guest" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guests.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.firstName} {guest.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                          variant="outline"
                          className={cn(
                            "h-11 w-full justify-start gap-3 rounded-xl border border-border/40 bg-card/80 text-left text-sm font-medium shadow-sm",
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
                    <PopoverContent className="w-auto rounded-2xl border border-border/50 bg-card/95 p-0 shadow-lg backdrop-blur" align="start">
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
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Rooms</FormLabel>
                  <ScrollArea className="h-44 w-full rounded-2xl border border-border/50 bg-card/80 shadow-sm">
                    <div className="space-y-3 p-4">
                      {availableRooms.length > 0 ? (
                        availableRooms.map((room) => {
                          const roomType = roomTypes.find(rt => rt.id === room.roomTypeId);
                          return (
                            <FormItem
                              key={room.id}
                              className="flex flex-row items-center gap-3 space-y-0 rounded-xl border border-border/40 bg-card/95 px-4 py-3 shadow-sm"
                            >
                              <FormControl>
                                <input
                                  type="radio"
                                  className="h-4 w-4"
                                  checked={field.value === room.id}
                                  onChange={() => field.onChange(room.id)}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">
                                Room {room.roomNumber} ({roomType?.name})
                              </FormLabel>
                            </FormItem>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          {selectedDateRange?.from ? "No rooms available." : "Select dates first."}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfGuests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Guests</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Pricing Preview</p>
                {pricingTotal !== null && (
                  <span className="text-sm font-semibold">
                    ${pricingTotal.toFixed(2)}
                  </span>
                )}
              </div>
              {pricingState.status === "idle" && (
                <p className="text-sm text-muted-foreground">
                  Select a room and date range to calculate nightly pricing.
                </p>
              )}
              {pricingState.status === "loading" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating nightly pricing...
                </div>
              )}
              {pricingState.status === "error" && (
                <Alert variant="destructive">
                  <AlertTitle>Pricing unavailable</AlertTitle>
                  <AlertDescription>{pricingState.error}</AlertDescription>
                </Alert>
              )}
              {pricingState.status === "success" && (
                <div className="space-y-3">
                  {pricingViolations.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTitle>Stay not allowed</AlertTitle>
                      <AlertDescription className="space-y-1 text-sm">
                        {pricingViolations.map((violation) => (
                          <p key={violation}>{violation}</p>
                        ))}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    {pricingState.data.items.map((night) => (
                      <div
                        key={night.day}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 bg-card/80 px-3 py-2"
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
                          {night.closed && (
                            <Badge variant="destructive">Closed</Badge>
                          )}
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
                </div>
              )}
            </div>
            <DialogFooter className="border-t border-border/40 pt-4 sm:justify-end">
              <Button
                type="submit"
                disabled={
                  pricingState.status !== "success" || pricingViolations.length > 0
                }
              >
                Save Reservation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

