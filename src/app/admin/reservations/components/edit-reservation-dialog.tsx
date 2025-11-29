"use client";

import * as React from "react";
import { areIntervalsOverlapping, differenceInDays, format, formatISO, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { ReservationDateRangePicker } from "@/components/reservations/date-range-picker";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { isBookableRoom, ROOM_STATUS_LABELS } from "@/lib/rooms";
import { calculateMultipleRoomPricing } from "@/lib/pricing-calculator";
import { resolveReservationTaxConfig } from "@/lib/reservations/calculate-financials";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import type { Reservation } from "@/data/types";
import type { ReservationWithDetails } from "@/app/admin/reservations/components/columns";
import { useDataContext } from "@/context/data-context";

const dateRangeSchema = z
  .object({
    from: z.date({ required_error: "Check-in is required" }),
    to: z.date({ required_error: "Check-out is required" }),
  })
  .superRefine((range, ctx) => {
    if (!range.from || !range.to) {
      return;
    }
    if (range.to <= range.from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Check-out must be after check-in",
        path: [],
      });
    }
  });

const buildEditReservationSchema = (
  resolveCapacity: (roomIds: string[]) => number
) =>
  z
    .object({
      dateRange: dateRangeSchema,
      adults: z.coerce.number().min(0, "Adults cannot be negative"),
      children: z.coerce.number().min(0, "Children cannot be negative"),
      roomIds: z.array(z.string()).min(1, "Select at least one room"),
      roomTypeId: z.string().optional(),
      notes: z.string().max(500, "Notes must be under 500 characters").optional(),
    })
    .superRefine((values, ctx) => {
      const totalGuests = (values.adults ?? 0) + (values.children ?? 0);
      if (totalGuests <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one guest is required",
          path: ["adults"],
        });
        return;
      }
      const capacity = resolveCapacity(values.roomIds ?? []);
      if (capacity > 0 && totalGuests > capacity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Guest count exceeds selected rooms capacity",
          path: ["roomIds"],
        });
      }
    });

type EditFormValues = z.infer<ReturnType<typeof buildEditReservationSchema>>;

type PendingRoomEntry = {
  key: string;
  kind: "kept" | "new" | "removed";
  reservation?: Reservation;
  roomId: string;
  roomLabel: string;
  roomTypeLabel?: string;
  occupancyLabel?: string;
};

export function EditReservationDialog({
  reservation,
  children,
}: {
  reservation: ReservationWithDetails;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const {
    updateReservation,
    addRoomsToBooking,
    reservations,
    rooms,
    roomTypes,
    guests,
    ratePlans,
    property,
    validateBookingRequest,
  } = useDataContext();

  const guest = React.useMemo(() => guests.find((g) => g.id === reservation.guestId), [guests, reservation.guestId]);

  const groupReservations = React.useMemo(
    () => reservations.filter((entry) => entry.bookingId === reservation.bookingId),
    [reservations, reservation.bookingId]
  );

  const activeGroupReservations = React.useMemo(
    () => groupReservations.filter((entry) => entry.status !== "Cancelled"),
    [groupReservations]
  );

  const initialRoomIds = React.useMemo(() => {
    const ids = activeGroupReservations.map((entry) => entry.roomId);
    if (ids.length) {
      return ids;
    }
    return [reservation.roomId];
  }, [activeGroupReservations, reservation.roomId]);

  const roomMap = React.useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);
  const roomTypeMap = React.useMemo(() => new Map(roomTypes.map((type) => [type.id, type])), [roomTypes]);

  const resolveCapacity = React.useCallback(
    (roomIds: string[]) =>
      roomIds.reduce((sum, roomId) => {
        const room = roomMap.get(roomId);
        if (!room) return sum;
        const roomType = roomTypeMap.get(room.roomTypeId);
        return sum + (roomType?.maxOccupancy ?? 0);
      }, 0),
    [roomMap, roomTypeMap]
  );

  const schema = React.useMemo(() => buildEditReservationSchema(resolveCapacity), [resolveCapacity]);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(reservation, initialRoomIds),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  React.useEffect(() => {
    form.reset(buildDefaultValues(reservation, initialRoomIds));
  }, [reservation, form, initialRoomIds]);

  const watchedDateRange = form.watch("dateRange");
  const adults = Number(form.watch("adults")) || 0;
  const childGuests = Number(form.watch("children")) || 0;
  const totalGuests = adults + childGuests;
  const rawSelectedRoomIds = form.watch("roomIds");
  const selectedRoomIds = React.useMemo(() => rawSelectedRoomIds ?? [], [rawSelectedRoomIds]);
  const selectedRoomTypeId = form.watch("roomTypeId") || undefined;

  const nights = React.useMemo(() => {
    if (!watchedDateRange?.from || !watchedDateRange?.to) return 0;
    return Math.max(differenceInDays(watchedDateRange.to, watchedDateRange.from), 1);
  }, [watchedDateRange]);

  const bookingRoomIds = React.useMemo(
    () => new Set(groupReservations.map((entry) => entry.roomId)),
    [groupReservations]
  );

  const allAvailableRooms = React.useMemo(() => {
    if (!watchedDateRange?.from || !watchedDateRange?.to) {
      return [];
    }
    const windowStart = watchedDateRange.from;
    const windowEnd = watchedDateRange.to;

    return rooms.filter((room) => {
      const belongsToBooking = bookingRoomIds.has(room.id);
      if (!isBookableRoom(room) && !belongsToBooking) {
        return false;
      }

      const overlaps = reservations.some((resEntry) => {
        if (resEntry.bookingId === reservation.bookingId) return false;
        if (resEntry.roomId !== room.id) return false;
        if (resEntry.status === "Cancelled") return false;
        return areIntervalsOverlapping(
          { start: windowStart, end: windowEnd },
          { start: parseISO(resEntry.checkInDate), end: parseISO(resEntry.checkOutDate) },
          { inclusive: false }
        );
      });

      if (overlaps && !belongsToBooking) {
        return false;
      }

      return true;
    });
  }, [watchedDateRange, rooms, reservations, reservation.bookingId, bookingRoomIds]);

  const filteredAvailableRooms = React.useMemo(() => {
    if (!selectedRoomTypeId || selectedRoomTypeId === "__all") {
      return allAvailableRooms;
    }
    return allAvailableRooms.filter((room) => room.roomTypeId === selectedRoomTypeId);
  }, [allAvailableRooms, selectedRoomTypeId]);

  const displayRooms = React.useMemo(() => {
    if (!selectedRoomIds.length) return filteredAvailableRooms;
    const knownRooms = selectedRoomIds
      .map((roomId) => roomMap.get(roomId))
      .filter((room): room is NonNullable<typeof room> => Boolean(room));
    const missingRooms = knownRooms.filter(
      (room) => !filteredAvailableRooms.some((available) => available.id === room.id)
    );
    return [...missingRooms, ...filteredAvailableRooms];
  }, [filteredAvailableRooms, selectedRoomIds, roomMap]);

  const pendingRoomEntries = React.useMemo<PendingRoomEntry[]>(() => {
    const entries: PendingRoomEntry[] = [];
    const selectedSet = new Set(selectedRoomIds);

    const buildRoomMeta = (roomId: string) => {
      const room = roomMap.get(roomId);
      const roomType = room ? roomTypeMap.get(room.roomTypeId) : undefined;
      return {
        roomLabel: room?.roomNumber ? `Room ${room.roomNumber}` : "Unassigned room",
        roomTypeLabel: roomType?.name,
        occupancyLabel: roomType?.maxOccupancy
          ? `${roomType.maxOccupancy} guests max`
          : undefined,
      } satisfies Pick<PendingRoomEntry, "roomLabel" | "roomTypeLabel" | "occupancyLabel">;
    };

    activeGroupReservations.forEach((entry) => {
      const kind: PendingRoomEntry["kind"] = selectedSet.has(entry.roomId)
        ? "kept"
        : "removed";
      entries.push({
        key: `${kind}-${entry.id}`,
        kind,
        reservation: entry,
        roomId: entry.roomId,
        ...buildRoomMeta(entry.roomId),
      });
    });

    selectedRoomIds.forEach((roomId) => {
      if (activeGroupReservations.some((entry) => entry.roomId === roomId)) {
        return;
      }
      entries.push({
        key: `new-${roomId}`,
        kind: "new",
        roomId,
        ...buildRoomMeta(roomId),
      });
    });

    const order: Record<PendingRoomEntry["kind"], number> = {
      kept: 0,
      new: 1,
      removed: 2,
    };

    return entries.sort((a, b) => order[a.kind] - order[b.kind]);
  }, [activeGroupReservations, roomMap, roomTypeMap, selectedRoomIds]);

  const selectedRoomsCapacity = React.useMemo(
    () => resolveCapacity(selectedRoomIds),
    [resolveCapacity, selectedRoomIds]
  );
  const hasCapacity = totalGuests > 0 && selectedRoomsCapacity >= totalGuests;
  const canSubmit = form.formState.isValid && hasCapacity && selectedRoomIds.length > 0;

  React.useEffect(() => {
    if (!displayRooms.length) return;
    const safeIds = new Set(displayRooms.map((room) => room.id));
    const current = form.getValues("roomIds") ?? [];
    const filtered = current.filter((id) => safeIds.has(id));
    if (filtered.length !== current.length) {
      form.setValue("roomIds", filtered, { shouldValidate: true });
    }
  }, [displayRooms, form]);

  React.useEffect(() => {
    void form.trigger("roomIds");
  }, [adults, childGuests, form]);

  const ratePlan = React.useMemo(
    () => ratePlans.find((plan) => plan.id === reservation.ratePlanId) ?? ratePlans[0],
    [ratePlans, reservation.ratePlanId]
  );

  const taxSnapshotSource = React.useMemo(
    () => activeGroupReservations[0] ?? reservation,
    [activeGroupReservations, reservation]
  );

  const taxConfig = React.useMemo(() => {
    const config = resolveReservationTaxConfig(taxSnapshotSource, property);
    return {
      enabled: config.enabled,
      percentage: config.percentage,
    };
  }, [taxSnapshotSource, property]);

  const selectedRoomTypes = React.useMemo(() => {
    return selectedRoomIds
      .map((roomId) => {
        const room = roomMap.get(roomId);
        if (!room) return null;
        return roomTypeMap.get(room.roomTypeId) ?? null;
      })
      .filter((type): type is NonNullable<typeof type> => Boolean(type));
  }, [selectedRoomIds, roomMap, roomTypeMap]);

  const formatCurrency = useCurrencyFormatter({ maximumFractionDigits: 0 });

  const pricing = React.useMemo(() => {
    if (!selectedRoomTypes.length || nights <= 0) return null;
    return calculateMultipleRoomPricing({
      roomTypes: selectedRoomTypes,
      ratePlan,
      nights: nights || 1,
      taxConfig,
    });
  }, [selectedRoomTypes, ratePlan, nights, taxConfig]);

  const handleRoomToggle = (roomId: string) => {
    const current = form.getValues("roomIds") ?? [];
    if (current.includes(roomId)) {
      form.setValue(
        "roomIds",
        current.filter((id) => id !== roomId),
        { shouldValidate: true }
      );
      return;
    }

    if (!watchedDateRange?.from || !watchedDateRange?.to) {
      toast.error("Select stay dates first.");
      return;
    }

    if (totalGuests <= 0) {
      toast.error("Add guests before selecting rooms.");
      return;
    }

    if (selectedRoomsCapacity >= totalGuests && totalGuests > 0) {
      toast.error("Capacity already matches guest count.");
      return;
    }

    form.setValue("roomIds", [...current, roomId], { shouldValidate: true });
  };

  const handleSubmit = async (values: EditFormValues) => {
    const { dateRange, adults: adultCount, children: childCount, notes } = values;
    if (!dateRange?.from || !dateRange?.to) {
      form.setError("dateRange", { message: "Select stay dates" });
      return;
    }

    const uniqueRoomIds = Array.from(new Set(values.roomIds));
    form.setValue("roomIds", uniqueRoomIds, { shouldValidate: true });

    const totalGuestsSelected = adultCount + childCount;
    const perReservationPayload = {
      checkInDate: formatISO(dateRange.from, { representation: "date" }),
      checkOutDate: formatISO(dateRange.to, { representation: "date" }),
      adultCount,
      childCount,
      numberOfGuests: totalGuestsSelected,
      notes: notes?.trim() || undefined,
    };

    const remainingReservations = [...activeGroupReservations];
    const assignments: Array<{ reservation: Reservation; roomId: string }> = [];

    uniqueRoomIds.forEach((roomId) => {
      const matchIndex = remainingReservations.findIndex((entry) => entry.roomId === roomId);
      if (matchIndex !== -1) {
        const matched = remainingReservations.splice(matchIndex, 1)[0];
        assignments.push({ reservation: matched, roomId });
      }
    });

    const roomsStillNeeded = uniqueRoomIds.filter(
      (roomId) => !assignments.some((assignment) => assignment.roomId === roomId)
    );

    const roomsToCreate: string[] = [];
    roomsStillNeeded.forEach((roomId) => {
      const reassignmentTarget = remainingReservations.shift();
      if (reassignmentTarget) {
        assignments.push({ reservation: reassignmentTarget, roomId });
      } else {
        roomsToCreate.push(roomId);
      }
    });

    const reservationsToCancel = [...remainingReservations];

    const dateSummary = `${format(dateRange.from, "MMM d, yyyy")} - ${format(
      dateRange.to,
      "MMM d, yyyy"
    )}`;

    try {
      const availabilityResults = await Promise.all(
        uniqueRoomIds.map(async (roomId) => ({
          roomId,
          result: await validateBookingRequest(
            perReservationPayload.checkInDate,
            perReservationPayload.checkOutDate,
            roomId,
            adultCount,
            childCount,
            reservation.bookingId
          ),
        }))
      );

      const unavailable = availabilityResults.find(({ result }) => !result.isValid);
      if (unavailable) {
        const room = roomMap.get(unavailable.roomId);
        const roomType = room ? roomTypeMap.get(room.roomTypeId) : undefined;
        const roomLabel = room?.roomNumber ? `Room ${room.roomNumber}` : "Selected room";
        const roomLine = roomType?.name ? `${roomLabel}, ${roomType.name}` : roomLabel;
        toast.error("These rooms are not available for these dates.", {
          description: `${dateSummary}\n${roomLine}.`,
        });
        return;
      }

      await Promise.all(
        assignments.map(({ reservation: entry, roomId }) =>
          updateReservation(entry.id, {
            ...perReservationPayload,
            roomId,
          })
        )
      );

      await Promise.all(
        reservationsToCancel.map((entry) =>
          updateReservation(entry.id, {
            status: "Cancelled",
          })
        )
      );

      if (roomsToCreate.length) {
        await addRoomsToBooking({
          bookingId: reservation.bookingId,
          roomIds: roomsToCreate,
          guestId: reservation.guestId,
          ratePlanId: reservation.ratePlanId,
          checkInDate: perReservationPayload.checkInDate,
          checkOutDate: perReservationPayload.checkOutDate,
          numberOfGuests: totalGuestsSelected,
          adultCount,
          childCount,
          status: reservation.status,
          notes: perReservationPayload.notes,
          bookingDate: reservation.bookingDate,
          source: reservation.source,
          paymentMethod:
            (reservation.paymentMethod as Reservation["paymentMethod"]) ?? "Not specified",
          taxEnabledSnapshot: Boolean(taxSnapshotSource?.taxEnabledSnapshot),
          taxRateSnapshot: taxSnapshotSource?.taxEnabledSnapshot
            ? taxSnapshotSource?.taxRateSnapshot ?? 0
            : 0,
        });
      }

      toast.success("Reservation updated successfully.");
      handleDialogChange(false);
    } catch (error) {
      toast.error("Failed to update reservation", {
        description: (error as Error).message,
      });
    }
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(buildDefaultValues(reservation, initialRoomIds));
    }
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Modify stay dates, guests, and assigned rooms for this reservation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 lg:grid-cols-[2fr_2fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-border/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guest</p>
                    <p className="text-base font-medium">
                      {guest ? `${guest.firstName} ${guest.lastName}` : reservation.guestName}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{guest?.email}</p>
                    <p>{guest?.phone || "No phone"}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-5 rounded-2xl border border-border/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Stay details</p>
                    <h3 className="text-base font-semibold">
                      {watchedDateRange?.from && watchedDateRange?.to
                        ? `${format(watchedDateRange.from, "MMM d, yyyy")} → ${format(
                            watchedDateRange.to,
                            "MMM d, yyyy"
                          )}`
                        : "Select dates"}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"}` : "-"}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ReservationDateRangePicker
                          value={field.value as DateRange | undefined}
                          onChange={field.onChange}
                          allowPastDates
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="adults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adults</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="children"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Children</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roomTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type Filter</FormLabel>
                        <Select
                          value={field.value ?? "__all"}
                          onValueChange={(value) => field.onChange(value === "__all" ? undefined : value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All room types" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__all">All room types</SelectItem>
                            {roomTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="rounded-xl border border-dashed border-border/50 p-3 text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-foreground">
                      {totalGuests} guest{totalGuests === 1 ? "" : "s"}
                    </span>
                    <span className="text-muted-foreground">
                      Capacity after changes: {selectedRoomsCapacity || "-"} / {totalGuests || "-"}
                    </span>
                    {!hasCapacity && totalGuests > 0 && (
                      <span className="text-destructive">Add more rooms or reduce guests.</span>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-5 rounded-2xl border border-border/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Available rooms</p>
                    <h3 className="text-base font-semibold">Select rooms for this stay</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoomIds.length > 0
                      ? `${selectedRoomIds.length} selected`
                      : `${pendingRoomEntries.length} pending`}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="roomIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select available rooms</FormLabel>
                      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {watchedDateRange?.from && watchedDateRange?.to ? (
                          displayRooms.length ? (
                            displayRooms.map((room) => {
                              const roomType = roomTypeMap.get(room.roomTypeId);
                              const statusLabel = ROOM_STATUS_LABELS[room.status] ?? room.status;
                              const isSelected = selectedRoomIds.includes(room.id);
                              return (
                                <label
                                  key={room.id}
                                  className={cn(
                                    "flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-3",
                                    isSelected ? "border-primary bg-primary/5" : "border-border/50"
                                  )}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => handleRoomToggle(room.id)}
                                  />
                                  <div className="flex flex-1 flex-col">
                                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                      <span>Room {room.roomNumber}</span>
                                      <Badge variant="outline" className="rounded-full text-xs">
                                        {statusLabel}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {roomType?.name}
                                      {roomType?.maxOccupancy ? ` · ${roomType.maxOccupancy} guests` : ""}
                                    </p>
                                  </div>
                                </label>
                              );
                            })
                          ) : (
                            <p className="rounded-xl border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
                              No rooms available for these filters.
                            </p>
                          )
                        ) : (
                          <p className="rounded-xl border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
                            Select dates to see available rooms.
                          </p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="rounded-2xl border border-border/60 p-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Optional notes for the front desk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>
            </div>

            <div className="space-y-6">
              <section className="space-y-4 rounded-2xl border border-border/60 p-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Summary</p>
                  <h3 className="text-base font-semibold">Review before saving</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">
                      {totalGuests} ({adults} Adults / {childGuests} Children)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nights</span>
                    <span className="font-medium">{nights || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rooms Selected</span>
                    <span className="font-medium">{selectedRoomIds.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className={cn("font-medium", hasCapacity ? "text-foreground" : "text-destructive")}>
                      {selectedRoomsCapacity} / {totalGuests}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{pricing ? formatCurrency(pricing.totalCost) : "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span className="font-semibold">
                      {pricing
                        ? `${
                            pricing.taxRatePercent
                              ? `${pricing.taxRatePercent.toFixed(
                                  pricing.taxRatePercent % 1 === 0 ? 0 : 2
                                )}% · `
                              : ""
                          }${formatCurrency(pricing.taxesAndFees)}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span className="font-medium">Grand Total</span>
                    <span className="font-semibold">{pricing ? formatCurrency(pricing.grandTotal) : "-"}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected Rooms</p>
                  {selectedRoomIds.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRoomIds.map((roomId) => {
                        const room = roomMap.get(roomId);
                        return (
                          <Badge key={roomId} variant="secondary" className="rounded-full px-3 py-1">
                            Room {room?.roomNumber ?? "-"}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No rooms selected.</p>
                  )}
                </div>
              </section>

              <div className="rounded-2xl border border-border/60 p-4">
                <DialogFooter className="flex flex-col gap-3">
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canSubmit || form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </div>

              <section className="space-y-4 rounded-2xl border border-border/60 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Booked rooms</p>
                    <h3 className="text-base font-semibold">
                      {pendingRoomEntries.length} room{pendingRoomEntries.length === 1 ? "" : "s"}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 rounded-xl border border-border/40 p-3">
                  {pendingRoomEntries.length ? (
                    pendingRoomEntries.map((entry) => {
                      const isPrimary = entry.reservation?.id === reservation.id;
                      const dateLine = entry.reservation
                        ? `${format(parseISO(entry.reservation.checkInDate), "MMM d")} → ${format(
                            parseISO(entry.reservation.checkOutDate),
                            "MMM d"
                          )}`
                        : "Will be added after saving";
                      const actionLabel =
                        entry.kind === "kept"
                          ? "Kept"
                          : entry.kind === "new"
                          ? "Will add"
                          : "Will remove";
                      const actionVariant = entry.kind === "removed" ? "outline" : entry.kind === "new" ? "default" : "secondary";
                      return (
                        <div
                          key={entry.key}
                          className={cn(
                            "flex items-center justify-between rounded-xl border px-3 py-2",
                            entry.kind === "new"
                              ? "border-primary/50 bg-primary/5"
                              : entry.kind === "removed"
                              ? "border-border/40 bg-muted/10"
                              : isPrimary
                              ? "border-primary/50 bg-primary/5"
                              : "border-border/50"
                          )}
                        >
                          <div>
                            <p className="font-medium">{entry.roomLabel}</p>
                            <p className="text-xs text-muted-foreground">{dateLine}</p>
                            {entry.roomTypeLabel && (
                              <p className="text-xs text-muted-foreground">
                                {entry.roomTypeLabel}
                                {entry.occupancyLabel ? ` · ${entry.occupancyLabel}` : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 text-xs font-semibold">
                            <Badge variant={actionVariant}>{actionLabel}</Badge>
                            {entry.reservation && (
                              <Badge variant="outline" className="capitalize">
                                {entry.reservation.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-xl border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
                      Select at least one room to preview assignments.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function buildDefaultValues(
  reservation: ReservationWithDetails,
  roomIds: string[]
): EditFormValues {
  return {
    dateRange: {
      from: parseISO(reservation.checkInDate),
      to: parseISO(reservation.checkOutDate),
    },
    adults: reservation.adultCount,
    children: reservation.childCount,
    roomIds,
    roomTypeId: undefined,
    notes: reservation.notes ?? "",
  };
}
