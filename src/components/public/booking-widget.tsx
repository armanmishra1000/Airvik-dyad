"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, Bed, Minus, Plus, Building } from "lucide-react";

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
    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-card border-border/50">
      <CardContent className="p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSearch)}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[2fr_1.5fr_auto] gap-4 items-start"
          >
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-14 justify-start text-left font-normal text-base",
                            !field.value?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-5 w-5" />
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
                            <span>Check-in — Check-out</span>
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
                  <FormMessage className="pl-2" />
                </FormItem>
              )}
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full h-14 justify-start text-left font-normal text-base"
                >
                  <Users className="mr-2 h-5 w-5" />
                  <div className="truncate">
                    <span>{rooms} room{rooms > 1 && 's'}, </span>
                    <span>{guests} adult{guests > 1 && 's'}</span>
                    {children > 0 && <span>, {children} children</span>}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Select Occupancy</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose rooms, adults, and children.
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span className="font-medium">Rooms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => form.setValue("rooms", Math.max(1, rooms - 1))} type="button"><Minus className="h-4 w-4" /></Button>
                        <span className="w-4 text-center">{rooms}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => form.setValue("rooms", rooms + 1)} type="button"><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span className="font-medium">Adults</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => form.setValue("guests", Math.max(1, guests - 1))} type="button"><Minus className="h-4 w-4" /></Button>
                        <span className="w-4 text-center">{guests}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => form.setValue("guests", guests + 1)} type="button"><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bed className="mr-2 h-4 w-4" />
                        <span className="font-medium">Children</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => form.setValue("children", Math.max(0, children - 1))} type="button"><Minus className="h-4 w-4" /></Button>
                        <span className="w-4 text-center">{children}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => form.setValue("children", children + 1)} type="button"><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button type="submit" className="w-full h-14 text-lg">
              Search
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}