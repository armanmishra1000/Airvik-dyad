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
import type { RoomType } from "@/data";
import { useAppContext } from "@/context/app-context";

const roomTypeSchema = z.object({
  name: z.string().min(1, "Room type name is required."),
  description: z.string().optional(),
  maxOccupancy: z.coerce.number().min(1, "Max occupancy must be at least 1."),
  bedTypes: z.string().min(1, "Please enter at least one bed type."),
  amenities: z.string().optional(),
});

interface RoomTypeFormDialogProps {
  roomType?: RoomType;
  children: React.ReactNode;
}

export function RoomTypeFormDialog({
  roomType,
  children,
}: RoomTypeFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { addRoomType, updateRoomType } = useAppContext();
  const isEditing = !!roomType;

  const form = useForm<z.infer<typeof roomTypeSchema>>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      name: roomType?.name || "",
      description: roomType?.description || "",
      maxOccupancy: roomType?.maxOccupancy || 1,
      bedTypes: roomType?.bedTypes.join(", ") || "",
      amenities: roomType?.amenities.join(", ") || "",
    },
  });

  function onSubmit(values: z.infer<typeof roomTypeSchema>) {
    const processedValues = {
      ...values,
      description: values.description || "",
      bedTypes: values.bedTypes.split(",").map((s) => s.trim()),
      amenities: values.amenities?.split(",").map((s) => s.trim()) || [],
    };

    if (isEditing && roomType) {
      updateRoomType(roomType.id, processedValues);
    } else {
      addRoomType(processedValues);
    }

    toast.success(
      `Room type ${isEditing ? "updated" : "created"} successfully!`
    );
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Room Type" : "Add New Room Type"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the room type.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Deluxe Double" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the room type."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxOccupancy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Occupancy</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bedTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bed Types</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1 King, 1 Sofa Bed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Wi-Fi, Ocean View, Balcony"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create Room Type"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}