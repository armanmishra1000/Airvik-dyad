"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Render a styled Calendar wrapped around react-day-picker with default layout, classNames, and navigation icons.
 *
 * @param className - Additional class names to be merged into the calendar container.
 * @param classNames - Optional DayPicker classNames overrides; merged with the component's defaults.
 * @param showOutsideDays - Whether to display days from adjacent months; defaults to `true`.
 * @returns The rendered React element for the calendar.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 text-foreground", className)}
      classNames={{
        months: "flex flex-col gap-6 lg:flex-row lg:gap-6",
        month: "space-y-4",
        caption: "relative flex items-center justify-center pt-2",
        caption_label: "text-sm font-serif font-semibold",
        nav: "flex items-center gap-2",
        nav_button:
          "inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "flex h-9 w-9 items-center justify-center rounded-xl text-[0.7rem] font-semibold uppercase text-muted-foreground",
        row: "mt-1 flex w-full",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:rounded-xl [&:has([aria-selected])]:bg-primary/10",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-xl [&:has(>.day-range-start)]:rounded-l-xl first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl [&:has([aria-selected])]:bg-primary/10"
            : "[&:has([aria-selected])]:bg-primary/10"
        ),
        day: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 aria-selected:text-primary",
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "border border-primary/40 bg-primary/10 text-primary",
        day_outside:
          "day-outside text-muted-foreground/70 aria-selected:bg-primary/5 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground/50 opacity-60",
        day_range_middle:
          "aria-selected:bg-primary/10 aria-selected:text-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }