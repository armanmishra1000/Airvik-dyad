"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, Bed, Minus, Plus, Building } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const searchSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  guests: z.coerce.number().min(1, "At least one adult is required."),
  children: z.coerce.number().min(0),
  rooms: z.coerce.number().min(1, "At least one room is required."),
});

export type BookingSearchFormValues = z.infer<typeof searchSchema>;

interface BookingWidgetProps {
  onSearch: (values: BookingSearchFormValues) => void;
}

export function BookingWidget({ onSearch }: BookingWidgetProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const form = useForm<BookingSearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      guests: 2,
      children: 0,
      rooms: 1,
    },
  });

  const { guests, children, rooms } = form.watch();

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-md border-border/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <CardContent className="relative p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSearch)}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[2fr_1.5fr_auto] gap-6 items-start"
          >
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => {
                const handleDateSelect = (range: DateRange | undefined) => {
                  if (range) {
                    field.onChange(range);
                  }
                };
                
                return (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-14 justify-start text-left font-normal text-base border-2 hover:border-primary/50 transition-all duration-300 bg-background/50",
                            !field.value?.from && "text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <div className="flex flex-col items-start">
                                    <span className="text-xs text-muted-foreground">Check-in → Check-out</span>
                                    <span className="text-sm font-medium">
                                      {format(field.value.from, "MMM dd")} - {format(field.value.to, "MMM dd, yyyy")}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-start">
                                    <span className="text-xs text-muted-foreground">Check-in date</span>
                                    <span className="text-sm font-medium">{format(field.value.from, "MMM dd, yyyy")}</span>
                                  </div>
                                )
                              ) : (
                                <span className="text-muted-foreground">Select dates</span>
                              )}
                            </div>
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 shadow-2xl border-2" align="start">
                      <div className="p-4 pb-3 bg-gradient-to-r from-primary/10 via-transparent to-primary/10">
                        <div className="flex justify-between items-center gap-8">
                          <div className="flex-1">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Check-in</div>
                            <div className="font-semibold text-base">
                              {field.value?.from ? format(field.value.from, "EEE, MMM d") : "Select date"}
                            </div>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div className="flex-1">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Check-out</div>
                            <div className="font-semibold text-base">
                              {field.value?.to ? format(field.value.to, "EEE, MMM d") : "Select date"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from || new Date()}
                        selected={field.value}
                        onSelect={handleDateSelect}
                        numberOfMonths={isMobile ? 1 : 2}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        modifiers={{
                          booked: [],
                        }}
                        modifiersStyles={{
                          booked: {
                            textDecoration: "line-through",
                            opacity: 0.5,
                          },
                        }}
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
                          day_today: "bg-accent text-accent-foreground font-bold rounded-md",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle: "aria-selected:bg-primary/20 aria-selected:text-accent-foreground rounded-md",
                          day_range_start: "aria-selected:bg-primary aria-selected:text-primary-foreground rounded-md",
                          day_range_end: "aria-selected:bg-primary aria-selected:text-primary-foreground rounded-md",
                          day_hidden: "invisible",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="pl-2" />
                </FormItem>
                );
              }}
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full h-14 justify-start text-left font-normal text-base border-2 hover:border-primary/50 transition-all duration-300 bg-background/50"
                >
                  <div className="flex items-center w-full">
                    <Users className="mr-3 h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-muted-foreground">Guests & Rooms</span>
                      <span className="text-sm font-medium">
                        {rooms} room{rooms > 1 && 's'}, {guests + children} guest{(guests + children) > 1 && 's'}
                      </span>
                    </div>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 shadow-2xl border-2">
                <div className="grid gap-5">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base">Select Occupancy</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust rooms and guests for your stay
                    </p>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Rooms</span>
                          <p className="text-xs text-muted-foreground">Number of rooms</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => form.setValue("rooms", Math.max(1, rooms - 1))} type="button"><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center font-semibold">{rooms}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => form.setValue("rooms", rooms + 1)} type="button"><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Adults</span>
                          <p className="text-xs text-muted-foreground">Ages 13 or above</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => form.setValue("guests", Math.max(1, guests - 1))} type="button"><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center font-semibold">{guests}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => form.setValue("guests", guests + 1)} type="button"><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Bed className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Children</span>
                          <p className="text-xs text-muted-foreground">Ages 0 to 12</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => form.setValue("children", Math.max(0, children - 1))} type="button"><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center font-semibold">{children}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => form.setValue("children", children + 1)} type="button"><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Search Availability</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}