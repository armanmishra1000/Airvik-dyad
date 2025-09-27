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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { type Room, type RoomStatus } from "@/data/types";
import { useDataContext } from "@/context/data-context";
import { MultiImageUpload } from "@/components/shared/multi-image-upload";

const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required."),
  roomTypeId: z.string({ required_error: "Please select a room type." }),
  status: z.string({ required_error: "Please select a status." }),
  photos: z.array(z.string()).optional(),
});

interface RoomFormDialogBuggyProps {
  room?: Room;
  children: React.ReactNode;
  bugType: 'stateReset' | 'modalClose' | 'validationBypass' | 'eventRemoval' | 'submissionFail';
}

const statuses: RoomStatus[] = ["Clean", "Dirty", "Inspected", "Maintenance"];

export function RoomFormDialogBuggy({
  room,
  children,
  bugType,
}: RoomFormDialogBuggyProps) {
  const [open, setOpen] = React.useState(false);
  const { addRoom, updateRoom, roomTypes } = useDataContext();
  const isEditing = !!room;

  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: room?.roomNumber || "",
      roomTypeId: room?.roomTypeId || "",
      status: room?.status || "Clean",
      photos: room?.photos || [],
    },
  });

  // BUG 1: State Reset during tab switch
  React.useEffect(() => {
    if (bugType === 'stateReset') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          console.log('BUG: Resetting form during tab switch');
          form.reset(); // This is the bug - resets form during tab switch
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [bugType, form]);

  // BUG 2: Modal Close during tab switch
  React.useEffect(() => {
    if (bugType === 'modalClose') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          console.log('BUG: Closing modal during tab switch');
          setOpen(false); // Bug: closes modal during tab switch
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [bugType]);

  // BUG 3: Event handler removal (no tab switch functionality)
  const handleOpenChange = bugType === 'eventRemoval' ? undefined : setOpen;

  async function onSubmit(values: z.infer<typeof roomSchema>) {
    // BUG 4: Validation bypass during tab switch
    if (bugType === 'validationBypass') {
      const shouldValidate = !document.hidden;
      if (!shouldValidate) {
        console.log('BUG: Bypassing validation during tab switch');
        // Submit invalid data when tab is inactive
        const invalidData = { ...values, roomNumber: '', status: '' };
        try {
          if (isEditing && room) {
            await updateRoom(room.id, invalidData);
          } else {
            await addRoom(invalidData);
          }
          toast.success('Room saved with invalid data (BUG!)');
          form.reset();
          setOpen(false);
          return;
        } catch (error) {
          toast.error('Failed to save room', {
            description: (error as Error).message,
          });
        }
      }
    }

    // BUG 5: Submission failure
    if (bugType === 'submissionFail') {
      console.log('BUG: Always failing submission');
      throw new Error('Submission failed (BUG!)');
    }

    // Normal submission logic
    const roomData = { ...values, status: values.status as RoomStatus, photos: values.photos || [] };
    try {
      if (isEditing && room) {
        await updateRoom(room.id, roomData);
      } else {
        await addRoom(roomData);
      }

      toast.success(
        `Room ${isEditing ? "updated" : "created"} successfully!`
      );
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save room", {
        description: (error as Error).message,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Room" : "Add New Room"} (BUGGY VERSION)
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the physical room. (Contains intentional bugs for testing)
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 101" {...field} />
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
                  <FormLabel>Room Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room-Specific Photos</FormLabel>
                  <FormControl>
                    <MultiImageUpload
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create Room"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}