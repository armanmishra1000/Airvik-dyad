"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Users,
  Minus,
  Plus,
  Baby,
  Building,
  Sparkles,
  Star,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDays, format, formatISO, isFriday, parse } from "date-fns";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useDisabledDates } from "../hooks/use-disabled-dates";
import { calculateNightCount, calculatePricing } from "../utils/pricing";
import type {
  RatePlan,
  Reservation,
  Room,
  RoomType,
} from "@/data/types";

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

interface BookingCardProps {
  roomType: RoomType;
  ratePlans: RatePlan[];
  reservations: Reservation[];
  rooms: Room[];
}

const TAX_RATE = 0.18;

function getNextWeekend() {
  const today = new Date();
  let nextFriday = today;

  while (!isFriday(nextFriday) || nextFriday <= today) {
    nextFriday = addDays(nextFriday, 1);
  }

  return { from: nextFriday, to: addDays(nextFriday, 2) };
}

export function BookingCard({ roomType, ratePlans, reservations, rooms }: BookingCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disabledDates = useDisabledDates(roomType, reservations, rooms);

  const [isDatesPopoverOpen, setIsDatesPopoverOpen] = React.useState(false);
  const [isGuestsPopoverOpen, setIsGuestsPopoverOpen] = React.useState(false);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);

  const standardRatePlan = React.useMemo(
    () => ratePlans.find((plan) => plan.name === "Standard Rate") || ratePlans[0],
    [ratePlans],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: searchParams.get("guests") ? Number(searchParams.get("guests")) : 2,
      children: searchParams.get("children") ? Number(searchParams.get("children")) : 0,
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
  const nightCount = calculateNightCount(
    { from: dateRange?.from, to: dateRange?.to },
  );
  const nightlyRate = standardRatePlan?.price || 3000;
  const { totalPrice, taxesAndFees, grandTotal } = calculatePricing(
    nightlyRate,
    nightCount,
    TAX_RATE,
  );

  const handleSubmit = (values: BookingFormValues) => {
    const query = new URLSearchParams({
      roomTypeId: roomType.id,
      from: formatISO(values.dateRange.from, { representation: "date" }),
      to: formatISO(values.dateRange.to, { representation: "date" }),
      guests: values.guests.toString(),
      children: values.children.toString(),
      rooms: "1",
    });

    if (values.specialRequests) {
      query.set("specialRequests", values.specialRequests);
    }

    router.push(`/book/review?${query.toString()}`);
  };

  return (
    <Card className="sticky top-32 rounded-xl shadow-xl bg-white">
      <CardHeader className="p-6 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-foreground">
                ₹{nightlyRate.toLocaleString()}
              </span>
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="rounded-xl border border-border/50 bg-white overflow-hidden">
              <div className="border-b">
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <Popover open={isDatesPopoverOpen} onOpenChange={setIsDatesPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              className="w-full px-4 py-4 flex gap-3 bg-transparent md:flex-row md:items-center md:justify-between md:text-left justify-between"
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
                              nav_button:
                                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                              nav_button_previous: "order-1",
                              nav_button_next: "order-2",
                              table: "w-full border-collapse",
                              head_row: "flex w-full",
                              head_cell:
                                "flex h-11 w-11 items-center justify-center text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground/70",
                              row: "mt-1 flex w-full",
                              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                              day: "inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:border-primary/50 focus-visible:bg-primary/5 aria-selected:hover:bg-primary aria-selected:hover:border-primary",
                              day_selected:
                                "inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground border border-primary",
                              day_today:
                                "inline-flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-border/60 text-foreground",
                              day_range_start:
                                "inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground border border-primary",
                              day_range_end:
                                "inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground border border-primary",
                              day_range_middle:
                                "inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-foreground aria-selected:!text-foreground border border-primary/20",
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
                        <Popover open={isGuestsPopoverOpen} onOpenChange={setIsGuestsPopoverOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-full px-4 py-4 flex justify-between gap-3 bg-transparent md:flex-row md:items-center md:justify-between md:text-left"
                            >
                              <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col text-start">
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
                                        Math.min(roomType.maxOccupancy, guestsField.value + 1),
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
                                        disabled={guestsField.value + childField.value >= roomType.maxOccupancy}
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

            {dateRange?.from && dateRange?.to && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₹{nightlyRate.toLocaleString()} × {nightCount} nights
                  </span>
                  <span className="font-medium text-foreground">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes &amp; fees</span>
                  <span className="font-medium text-foreground">
                    ₹{Math.round(taxesAndFees).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-border/50" />
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-foreground">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-semibold text-primary">
                      ₹{Math.round(grandTotal).toLocaleString()}
                    </span>
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
  );
}
