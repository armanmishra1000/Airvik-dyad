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
import type { RatePlan } from "@/data/types";
import { useDataContext } from "@/context/data-context";

const ratePlanSchema = z.object({
  name: z.string().min(1, "Rate plan name is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  minStay: z.coerce.number().min(1, "Minimum stay must be at least 1."),
  cancellationPolicy: z.string().min(1, "Cancellation policy is required."),
});

interface RatePlanFormDialogProps {
  ratePlan?: RatePlan;
  children: React.ReactNode;
}

/**
 * Renders a dialog containing a form to create or edit a rate plan.
 *
 * The dialog is controlled internally and opened by rendering `children` as the trigger.
 * When `ratePlan` is provided the form is populated for editing and submission updates
 * the existing rate plan; otherwise submission creates a new rate plan.
 *
 * The form collects: name, price (per night), minimum stay (nights), and cancellation policy.
 * Validation: name is required and non-empty, price must be greater than or equal to 0,
 * and minimum stay must be greater than or equal to 1.
 *
 * @param ratePlan - Optional existing rate plan to edit; when omitted the form creates a new rate plan.
 * @param children - Trigger element(s) that open the dialog when interacted with.
 * @returns The dialog element containing the rate plan form and trigger. 
 */
export function RatePlanFormDialog({
  ratePlan,
  children,
}: RatePlanFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { addRatePlan, updateRatePlan } = useDataContext();
  const isEditing = !!ratePlan;

  const form = useForm<z.infer<typeof ratePlanSchema>>({
    resolver: zodResolver(ratePlanSchema),
    defaultValues: {
      name: ratePlan?.name || "",
      price: ratePlan?.price || 0,
      minStay: ratePlan?.rules.minStay || 1,
      cancellationPolicy: ratePlan?.rules.cancellationPolicy || "",
    },
  });

  async function onSubmit(values: z.infer<typeof ratePlanSchema>) {
    const ratePlanData = {
      name: values.name,
      price: values.price,
      rules: {
        minStay: values.minStay,
        cancellationPolicy: values.cancellationPolicy,
      },
    };

    try {
      if (isEditing && ratePlan) {
        await updateRatePlan(ratePlan.id, ratePlanData);
      } else {
        await addRatePlan(ratePlanData);
      }

      toast.success(
        `Rate plan ${isEditing ? "updated" : "created"} successfully!`
      );
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save rate plan", {
        description: (error as Error).message,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Rate Plan" : "Add New Rate Plan"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the rate plan.
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
                    <Input placeholder="e.g., Standard Rate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (per night)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minStay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stay (nights)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cancellationPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the cancellation rules..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create Rate Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}