"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  guests: z.coerce.number().min(1, "At least one guest is required."),
});

export type BookingSearchFormValues = z.infer<typeof searchSchema>;

interface BookingWidgetProps {
  onSearch: (values: BookingSearchFormValues) => void;
}

export function BookingWidget({ onSearch }: BookingWidgetProps) {
  const form = useForm<BookingSearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      guests: 1,
    },
  });

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSearch)}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[2fr_1fr_auto] gap-4 items-start"
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
            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="h-14 pl-10 text-base"
                        placeholder="Guests"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="pl-2" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-14 text-lg">
              Search
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}