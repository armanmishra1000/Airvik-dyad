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
import type { Guest } from "@/data/types";
import { useDataContext } from "@/context/data-context";

const guestSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(1, "Phone number is required."),
});

interface GuestFormDialogProps {
  guest?: Guest;
  children: React.ReactNode;
}

/**
 * Render a dialog containing a form to create a new guest or edit an existing guest.
 *
 * The dialog manages its open state, validates input against the guest schema, and
 * calls the data context to add or update the guest on submit. On success the form
 * resets and the dialog closes; on error a toast with the error message is shown.
 *
 * @param guest - Optional existing guest to prefill the form for editing; if omitted the form is for creating a new guest.
 * @param children - The trigger element rendered inside the dialog trigger that opens the form when activated.
 * @returns The dialog element that contains the guest form and its trigger.
 */
export function GuestFormDialog({
  guest,
  children,
}: GuestFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { addGuest, updateGuest } = useDataContext();
  const isEditing = !!guest;

  const form = useForm<z.infer<typeof guestSchema>>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: guest?.firstName || "",
      lastName: guest?.lastName || "",
      email: guest?.email || "",
      phone: guest?.phone || "",
    },
  });

  async function onSubmit(values: z.infer<typeof guestSchema>) {
    try {
      if (isEditing && guest) {
        await updateGuest(guest.id, values);
      } else {
        await addGuest(values);
      }
      
      toast.success(
        `Guest ${isEditing ? "updated" : "created"} successfully!`
      );
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save guest", {
        description: (error as Error).message,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the guest.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="555-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="border-t border-border/40 pt-4 sm:justify-end">
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create Guest"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}