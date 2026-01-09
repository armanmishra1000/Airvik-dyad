"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { CountryCombobox } from "@/components/ui/country-combobox";
import type { Guest } from "@/data/types";
import { useDataContext } from "@/context/data-context";
import { validatePhoneByCountry, validatePincodeByCountry } from "@/lib/validators/country-validation";
import { getCountryDialCode } from "@/lib/countries";

const optionalEmailSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(
    z.union([
      z.literal(""),
      z.string().email("Please enter a valid email address."),
    ])
  );

const guestSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: optionalEmailSchema,
    phone: z.string().min(1, "Phone number is required."),
    address: z.string().trim().min(1, "Address is required."),
    pincode: z.string().trim().min(1, "Postal code is required."),
    city: z.string().trim().min(1, "City is required."),
    country: z.string().trim().min(2, "Country is required."),
  })
  .refine(
    (data) => {
      if (!data.country) {
        return true;
      }
      return validatePhoneByCountry(data.phone, data.country);
    },
    {
      message: "Invalid phone number format for this country",
      path: ["phone"],
    }
  )
  .refine(
    (data) => {
      if (!data.country) {
        return true;
      }
      return validatePincodeByCountry(data.pincode, data.country);
    },
    {
      message: "Invalid postal code format for this country",
      path: ["pincode"],
    }
  );

interface GuestFormDialogProps {
  guest?: Guest;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onGuestCreated?: (guest: Guest) => void;
}

export function GuestFormDialog({
  guest,
  children,
  defaultOpen = false,
  onGuestCreated,
}: GuestFormDialogProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const { addGuest, updateGuest } = useDataContext();
  const isEditing = !!guest;

  const form = useForm<z.infer<typeof guestSchema>>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: guest?.firstName || "",
      lastName: guest?.lastName || "",
      email: guest?.email || "",
      phone: guest?.phone || "",
      address: guest?.address || "",
      pincode: guest?.pincode || "",
      city: guest?.city || "",
      country: guest?.country || "",
    },
  });

  const countryValue = useWatch({
    control: form.control,
    name: "country",
  });

  const dialCode = getCountryDialCode(countryValue);
  const isIndia = countryValue === "IN";
  const isUSA = countryValue === "US";
  const isUK = countryValue === "GB";
  const isCanada = countryValue === "CA";

  React.useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  async function onSubmit(values: z.infer<typeof guestSchema>) {
    try {
      if (isEditing && guest) {
        await updateGuest(guest.id, values);
        form.reset({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          pincode: values.pincode,
          city: values.city,
          country: values.country,
        });
      } else {
        const created = await addGuest(values);
        form.reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          pincode: "",
          city: "",
          country: "",
        });
        onGuestCreated?.(created);
      }

      toast.success(
        `Guest ${isEditing ? "updated" : "created"} successfully!`
      );
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save guest", {
        description: (error as Error).message,
      });
    }
  }

  React.useEffect(() => {
    if (!open) return;
    if (guest) {
      form.reset({
        firstName: guest.firstName || "",
        lastName: guest.lastName || "",
        email: guest.email || "",
        phone: guest.phone || "",
        address: guest.address || "",
        pincode: guest.pincode || "",
        city: guest.city || "",
        country: guest.country || "",
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        pincode: "",
        city: "",
        country: "",
      });
    }
  }, [guest, open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
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
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      {...field}
                      type="email"
                    />
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
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-muted-foreground whitespace-nowrap">
                      {dialCode}
                    </span>
                    <Input
                      placeholder={isIndia ? "1234567890" : isUSA ? "5551234567" : "123456"}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={isIndia ? 10 : 15}
                      {...field}
                      onChange={(event) => {
                        const digitsOnly = event.target.value.replace(/\D/g, "");
                        field.onChange(digitsOnly);
                      }}
                    />
                  </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isUSA ? "ZIP Code" : isUK ? "Postcode" : isCanada ? "Postal Code" : "Pincode"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isUSA
                            ? "12345"
                            : isUK
                            ? "SW1A 0AA"
                              : isCanada
                              ? "K1A 0B1"
                                : "110001"
                        }
                        inputMode={isUK ? "text" : "numeric"}
                        pattern={isUK ? "[A-Z0-9 ]*" : "[0-9]*"}
                        maxLength={isIndia ? 6 : 10}
                        {...field}
                        onChange={(event) => {
                          const digitsOnly = event.target.value.replace(/\D/g, "");
                          field.onChange(isUK ? event.target.value : digitsOnly);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <CountryCombobox
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select country..."
                      />
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
