"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type ReservationDateRangePickerProps = {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  disabled?: boolean;
};

export function ReservationDateRangePicker({
  value,
  onChange,
  className,
  disabled = false,
}: ReservationDateRangePickerProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const popoverOffset = isMobile ? 12 : 40;

  const handleSelect = (range: DateRange | undefined) => {
    onChange(range);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-14 justify-start text-left font-normal text-base border hover:border-primary/50 transition-all duration-300 bg-background/50",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
              {value?.from ? (
                value.to ? (
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-muted-foreground">Check-in → Check-out</span>
                    <span className="text-sm font-medium">
                      {format(value.from, "MMM dd")} - {format(value.to, "MMM dd, yyyy")}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-muted-foreground">Check-in date</span>
                    <span className="text-sm font-medium">{format(value.from, "MMM dd, yyyy")}</span>
                  </div>
                )
              ) : (
                <span className="text-muted-foreground">Select dates</span>
              )}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={popoverOffset}
        className="w-full max-w-[min(100vw-1.5rem,640px)] md:max-w-none border border-border/40 rounded-2xl bg-white shadow-xl px-4 py-4 md:px-5 md:py-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="px-5 py-4 border-b border-border/30">
          <div className="flex gap-4 md:flex-row md:items-start md:justify-between text-sm">
            <div className="flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Check-in</span>
              <span className="mt-1 block text-base font-medium text-foreground">
                {value?.from ? format(value.from, "EEE, MMM d") : "Select date"}
              </span>
            </div>
            <div className="flex-1 text-right">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Check-out</span>
              <span className="mt-1 block text-base font-medium text-foreground">
                {value?.to ? format(value.to, "EEE, MMM d") : "Select date"}
              </span>
            </div>
          </div>
        </div>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from || new Date()}
          selected={value}
          onSelect={handleSelect}
          numberOfMonths={isMobile ? 1 : 2}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          showOutsideDays
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
              "day-range-start inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground border border-primary",
            day_range_end:
              "day-range-end inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground border border-primary",
            day_range_middle:
              "day-range-middle inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-foreground aria-selected:!text-foreground border border-primary/20",
            day_outside: "pointer-events-none opacity-0 select-none",
            day_disabled: "opacity-40 text-muted-foreground hover:border-transparent hover:bg-transparent",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
