"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { RatePlan, RatePlanSeason } from "@/data/types";
import { useDataContext } from "@/context/data-context";

const seasonOverrideSchema = z.object({
  room_type_id: z.string().min(1, "Please select a room type"),
  date_range: z.object({
    from: z.date(),
    to: z.date(),
  }).refine((range) => range.to > range.from, {
    message: "End date must be after start date",
  }),
  price_override: z.coerce.number().positive().optional().or(z.literal("")),
  min_stay: z.coerce.number().int().positive().optional().or(z.literal("")),
  max_stay: z.coerce.number().int().positive().optional().or(z.literal("")),
  closed_to_arrival: z.boolean(),
  closed_to_departure: z.boolean(),
  closed_dates: z.array(z.date()).optional(),
}).refine(
  (data) => {
    if (data.min_stay && data.max_stay) {
      const min = typeof data.min_stay === 'number' ? data.min_stay : parseInt(String(data.min_stay));
      const max = typeof data.max_stay === 'number' ? data.max_stay : parseInt(String(data.max_stay));
      return min <= max;
    }
    return true;
  },
  { message: "Minimum stay must be less than or equal to maximum stay", path: ["max_stay"] }
);

type SeasonOverrideFormData = z.infer<typeof seasonOverrideSchema>;

interface SeasonOverrideDialogProps {
  ratePlan: RatePlan;
  season?: RatePlanSeason;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SeasonOverrideDialog({
  ratePlan,
  season,
  open,
  onOpenChange,
}: SeasonOverrideDialogProps) {
  const {
    roomTypes,
    ratePlanClosedDates,
    addRatePlanSeason,
    updateRatePlanSeason,
    addRatePlanClosedDate,
    deleteRatePlanClosedDate,
  } = useDataContext();

  const isEditing = !!season;
  const [closedDatesExpanded, setClosedDatesExpanded] = React.useState(false);

  // Get closed dates for this season
  const existingClosedDates = React.useMemo(() => {
    if (!season) return [];
    return ratePlanClosedDates.filter(cd => cd.rate_plan_season_id === season.id);
  }, [ratePlanClosedDates, season]);

  const form = useForm<SeasonOverrideFormData>({
    resolver: zodResolver(seasonOverrideSchema),
    defaultValues: {
      room_type_id: season?.room_type_id || "",
      date_range: season
        ? { from: new Date(season.start_date), to: new Date(season.end_date) }
        : { from: undefined, to: undefined },
      price_override: season?.price_override || "",
      min_stay: season?.min_stay || "",
      max_stay: season?.max_stay || "",
      closed_to_arrival: season?.closed_to_arrival ?? false,
      closed_to_departure: season?.closed_to_departure ?? false,
      closed_dates: existingClosedDates.map(cd => new Date(cd.closed_date)),
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        room_type_id: season?.room_type_id || "",
        date_range: season
          ? { from: new Date(season.start_date), to: new Date(season.end_date) }
          : { from: undefined, to: undefined },
        price_override: season?.price_override || "",
        min_stay: season?.min_stay || "",
        max_stay: season?.max_stay || "",
        closed_to_arrival: season?.closed_to_arrival ?? false,
        closed_to_departure: season?.closed_to_departure ?? false,
        closed_dates: existingClosedDates.map(cd => new Date(cd.closed_date)),
      });
    }
  }, [open, season, existingClosedDates, form]);

  async function onSubmit(values: SeasonOverrideFormData) {
    try {
      const seasonData = {
        rate_plan_id: ratePlan.id,
        room_type_id: values.room_type_id,
        start_date: format(values.date_range.from, 'yyyy-MM-dd'),
        end_date: format(values.date_range.to, 'yyyy-MM-dd'),
        price_override: values.price_override ? Number(values.price_override) : undefined,
        min_stay: values.min_stay ? Number(values.min_stay) : undefined,
        max_stay: values.max_stay ? Number(values.max_stay) : undefined,
        closed_to_arrival: values.closed_to_arrival,
        closed_to_departure: values.closed_to_departure,
      };

      let seasonId: string;

      if (isEditing && season) {
        await updateRatePlanSeason(season.id, seasonData);
        seasonId = season.id;
      } else {
        // For new seasons, we need to get the ID after creation
        // This requires modifying the add method to return the data
        await addRatePlanSeason(seasonData);
        // Note: In production, you'd want addRatePlanSeason to return the created season
        // For now, we'll handle closed dates separately
        toast.success("Seasonal override created successfully!");
        form.reset();
        onOpenChange(false);
        return;
      }

      // Handle closed dates
      const newClosedDates = values.closed_dates || [];
      const newClosedDateStrings = newClosedDates.map(d => format(d, 'yyyy-MM-dd'));
      const existingClosedDateStrings = existingClosedDates.map(cd => cd.closed_date);

      // Delete removed dates
      for (const existing of existingClosedDates) {
        if (!newClosedDateStrings.includes(existing.closed_date)) {
          await deleteRatePlanClosedDate(existing.id);
        }
      }

      // Add new dates
      for (const dateStr of newClosedDateStrings) {
        if (!existingClosedDateStrings.includes(dateStr)) {
          await addRatePlanClosedDate({
            rate_plan_season_id: seasonId,
            closed_date: dateStr,
          });
        }
      }

      toast.success(
        `Seasonal override ${isEditing ? "updated" : "created"} successfully!`
      );
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save seasonal override", {
        description: (error as Error).message,
      });
    }
  }

  const selectedRoomType = roomTypes.find(rt => rt.id === form.watch("room_type_id"));
  const dateRange = form.watch("date_range");
  const closedDates = form.watch("closed_dates") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit" : "Add"} Seasonal Override
          </DialogTitle>
          <DialogDescription>
            Configure special pricing and restrictions for &quot;{ratePlan.name}&quot; during specific dates.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[calc(90vh-200px)] pr-4">
              <div className="space-y-6">
                {/* Room Type Select */}
                <FormField
                  control={form.control}
                  name="room_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypes.map(rt => (
                            <SelectItem key={rt.id} value={rt.id}>
                              {rt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Range Picker */}
                <FormField
                  control={form.control}
                  name="date_range"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Range *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value?.from && "text-muted-foreground"
                              )}
                            >
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "PPP")} - {format(field.value.to, "PPP")}
                                  </>
                                ) : (
                                  format(field.value.from, "PPP")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Select the start and end dates for this override.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Override */}
                <FormField
                  control={form.control}
                  name="price_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Override (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Leave empty to use base price"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Override the base nightly rate for this period.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stay Restrictions */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="min_stay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stay (nights)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Optional"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_stay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Stay (nights)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Optional"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Booking Restrictions */}
                <div className="space-y-4 rounded-xl border border-border/50 bg-card/50 p-4">
                  <h3 className="text-sm font-medium">Booking Restrictions</h3>
                  
                  <FormField
                    control={form.control}
                    name="closed_to_arrival"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                          <FormLabel>Closed to Arrival (CTA)</FormLabel>
                          <FormDescription>
                            Guests cannot check in during this period
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closed_to_departure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                          <FormLabel>Closed to Departure (CTD)</FormLabel>
                          <FormDescription>
                            Guests cannot check out during this period
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Closed Dates Section */}
                {isEditing && (
                  <Collapsible
                    open={closedDatesExpanded}
                    onOpenChange={setClosedDatesExpanded}
                    className="space-y-2 rounded-xl border border-border/50 bg-card/50 p-4"
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            closedDatesExpanded && "rotate-90"
                          )}
                        />
                        <h3 className="text-sm font-medium">
                          Closed Dates (optional)
                        </h3>
                      </div>
                      {closedDates.length > 0 && (
                        <Badge variant="secondary">{closedDates.length} dates</Badge>
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="closed_dates"
                        render={({ field }) => (
                          <FormItem>
                            <FormDescription>
                              Select specific dates to close completely
                            </FormDescription>
                            <FormControl>
                              <div className="flex justify-center">
                                <Calendar
                                  mode="multiple"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  className="rounded-md border"
                                />
                              </div>
                            </FormControl>
                            {closedDates.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Selected dates:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {closedDates.map((date, idx) => (
                                    <Badge key={idx} variant="outline">
                                      {format(date, "MMM d, yyyy")}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="border-t border-border/40 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Override"
                  : "Create Override"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
