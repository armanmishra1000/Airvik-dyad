"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { RatePlan } from "@/data/types";
import { useDataContext } from "@/context/data-context";
import { ScrollArea } from "@/components/ui/scroll-area";

// Schema for individual room type assignment
const assignmentSchema = z.object({
  room_type_id: z.string(),
  base_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  is_primary: z.boolean(),
});

// Schema for the entire form
const assignRatePlanSchema = z.object({
  assignments: z
    .array(assignmentSchema)
    .min(1, "Please select at least one room type")
    .refine(
      (assignments) => assignments.filter((a) => a.is_primary).length === 1,
      {
        message: "Exactly one room type must be marked as primary",
      }
    ),
});

type AssignmentFormData = z.infer<typeof assignRatePlanSchema>;
type Assignment = z.infer<typeof assignmentSchema>;

interface AssignRatePlanDialogProps {
  ratePlan: RatePlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRatePlanDialog({
  ratePlan,
  open,
  onOpenChange,
}: AssignRatePlanDialogProps) {
  const { roomTypes, roomRatePlans, addRoomRatePlan, updateRoomRatePlan, deleteRoomRatePlan } =
    useDataContext();

  // Get existing assignments for this rate plan
  const existingAssignments = React.useMemo(
    () => roomRatePlans.filter((rrp) => rrp.rate_plan_id === ratePlan.id),
    [roomRatePlans, ratePlan.id]
  );

  // Track which room types are selected
  const [selectedRoomTypeIds, setSelectedRoomTypeIds] = React.useState<Set<string>>(
    new Set(existingAssignments.map((a) => a.room_type_id))
  );

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignRatePlanSchema),
    defaultValues: {
      assignments: existingAssignments.map((a) => ({
        room_type_id: a.room_type_id,
        base_price: a.base_price,
        is_primary: a.is_primary,
      })),
    },
  });

  // Update form when existing assignments change
  React.useEffect(() => {
    if (open) {
      const assignments = existingAssignments.map((a) => ({
        room_type_id: a.room_type_id,
        base_price: a.base_price,
        is_primary: a.is_primary,
      }));
      
      form.reset({ assignments });
      setSelectedRoomTypeIds(new Set(existingAssignments.map((a) => a.room_type_id)));
    }
  }, [open, existingAssignments, form]);

  const handleRoomTypeToggle = (roomTypeId: string, checked: boolean) => {
    const newSelected = new Set(selectedRoomTypeIds);
    const currentAssignments = form.getValues("assignments");

    if (checked) {
      newSelected.add(roomTypeId);
      // Add new assignment with default values
      const isPrimary = currentAssignments.length === 0; // First one is primary by default
      form.setValue("assignments", [
        ...currentAssignments,
        {
          room_type_id: roomTypeId,
          base_price: ratePlan.price, // Use rate plan's default price
          is_primary: isPrimary,
        },
      ]);
    } else {
      newSelected.delete(roomTypeId);
      // Remove the assignment
      const filtered = currentAssignments.filter((a) => a.room_type_id !== roomTypeId);
      
      // If we removed the primary, make the first remaining one primary
      if (filtered.length > 0 && !filtered.some((a) => a.is_primary)) {
        filtered[0].is_primary = true;
      }
      
      form.setValue("assignments", filtered);
    }

    setSelectedRoomTypeIds(newSelected);
  };

  const handlePrimaryChange = (roomTypeId: string) => {
    const currentAssignments = form.getValues("assignments");
    const updated = currentAssignments.map((a) => ({
      ...a,
      is_primary: a.room_type_id === roomTypeId,
    }));
    form.setValue("assignments", updated);
  };

  const handlePriceChange = (roomTypeId: string, value: string) => {
    const currentAssignments = form.getValues("assignments");
    const updated = currentAssignments.map((a) =>
      a.room_type_id === roomTypeId ? { ...a, base_price: parseFloat(value) || 0 } : a
    );
    form.setValue("assignments", updated);
  };

  async function onSubmit(values: AssignmentFormData) {
    try {
      // Get the IDs of assignments that should exist
      const newAssignmentRoomIds = new Set(values.assignments.map((a) => a.room_type_id));
      const existingMap = new Map(existingAssignments.map((a) => [a.room_type_id, a]));

      // Delete assignments that were removed
      for (const existing of existingAssignments) {
        if (!newAssignmentRoomIds.has(existing.room_type_id)) {
          await deleteRoomRatePlan(existing.id);
        }
      }

      // Update or create assignments
      for (const assignment of values.assignments) {
        const existing = existingMap.get(assignment.room_type_id);
        
        if (existing) {
          // Update if values changed
          if (
            existing.base_price !== assignment.base_price ||
            existing.is_primary !== assignment.is_primary
          ) {
            await updateRoomRatePlan(existing.id, {
              base_price: assignment.base_price,
              is_primary: assignment.is_primary,
            });
          }
        } else {
          // Create new assignment
          await addRoomRatePlan({
            room_type_id: assignment.room_type_id,
            rate_plan_id: ratePlan.id,
            base_price: assignment.base_price,
            is_primary: assignment.is_primary,
          });
        }
      }

      toast.success(
        `Rate plan assigned to ${values.assignments.length} room type${
          values.assignments.length > 1 ? "s" : ""
        }`
      );
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save assignments", {
        description: (error as Error).message,
      });
    }
  }

  const currentAssignments = form.watch("assignments");
  const primaryRoomTypeId = currentAssignments.find((a) => a.is_primary)?.room_type_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Rate Plan to Rooms</DialogTitle>
          <DialogDescription>
            Assign &quot;{ratePlan.name}&quot; to room types and set base prices. One
            room type must be marked as primary.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {roomTypes.map((roomType) => {
                  const isSelected = selectedRoomTypeIds.has(roomType.id);
                  const assignment = currentAssignments.find(
                    (a) => a.room_type_id === roomType.id
                  );

                  return (
                    <div
                      key={roomType.id}
                      className="rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleRoomTypeToggle(roomType.id, checked as boolean)
                          }
                          className="mt-1"
                        />

                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="font-medium">{roomType.name}</p>
                            {roomType.description && (
                              <p className="text-sm text-muted-foreground">
                                {roomType.description}
                              </p>
                            )}
                          </div>

                          {isSelected && assignment && (
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormItem>
                                <FormLabel>Base Price (per night)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={assignment.base_price}
                                    onChange={(e) =>
                                      handlePriceChange(roomType.id, e.target.value)
                                    }
                                    placeholder="Enter base price"
                                  />
                                </FormControl>
                              </FormItem>

                              <FormItem className="flex flex-col justify-end">
                                <FormLabel>Primary Assignment</FormLabel>
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroup
                                      value={primaryRoomTypeId}
                                      onValueChange={handlePrimaryChange}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                          value={roomType.id}
                                          id={`primary-${roomType.id}`}
                                        />
                                        <label
                                          htmlFor={`primary-${roomType.id}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          Set as primary
                                        </label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </FormControl>
                              </FormItem>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {form.formState.errors.assignments && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.assignments.message}
              </p>
            )}

            <DialogFooter className="border-t border-border/40 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Assignments"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
