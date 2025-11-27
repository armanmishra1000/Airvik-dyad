"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDataContext } from "@/context/data-context";
import { ImageUpload } from "@/components/shared/image-upload";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const propertySchema = z.object({
  name: z.string().min(1, "Property name is required."),
  address: z.string().min(1, "Address is required."),
  phone: z.string().min(1, "Phone number is required."),
  email: z.string().email("Please enter a valid email."),
  logo_url: z.string().optional(),
  photos: z.string().optional(),
  google_maps_url: z
    .string()
    .transform((v) => (v ?? "").trim())
    .refine(
      (v) => v === "" || z.string().url().safeParse(v).success,
      "Please enter a valid Google Maps embed URL."
    )
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  tax_enabled: z.boolean().default(false),
  tax_percentage: z.coerce
    .number({ invalid_type_error: "Enter a valid percentage" })
    .min(0, "Tax percentage cannot be negative")
    .max(100, "Tax percentage cannot exceed 100"),
}).superRefine((data, ctx) => {
  if (data.tax_enabled && data.tax_percentage <= 0) {
    ctx.addIssue({
      path: ["tax_percentage"],
      code: z.ZodIssueCode.custom,
      message: "Enter a percentage greater than 0 when taxes are enabled.",
    });
  }
});

export function PropertySettingsForm() {
  const { property, updateProperty } = useDataContext();

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property.name || "",
      address: property.address || "",
      phone: property.phone || "",
      email: property.email || "",
      logo_url: property.logo_url || "",
      photos: property.photos?.join(", ") || "",
      google_maps_url: property.google_maps_url || "",
      tax_enabled: property.tax_enabled ?? false,
      tax_percentage: (property.tax_percentage ?? 0) * 100,
    },
  });

  const google_maps_url = form.watch("google_maps_url");
  const taxEnabled = form.watch("tax_enabled");

  React.useEffect(() => {
    form.reset({
      name: property.name,
      address: property.address,
      phone: property.phone,
      email: property.email,
      logo_url: property.logo_url,
      photos: property.photos?.join(", ") || "",
      google_maps_url: property.google_maps_url,
      tax_enabled: property.tax_enabled ?? false,
      tax_percentage: (property.tax_percentage ?? 0) * 100,
    });
  }, [property, form]);

  function onSubmit(values: z.infer<typeof propertySchema>) {
    const normalizedTaxPercentage = values.tax_enabled
      ? values.tax_percentage / 100
      : 0;
    const updatedData = {
      ...values,
      logo_url: values.logo_url || "",
      photos: values.photos ? values.photos.split(",").map(p => p.trim()).filter(Boolean) : [],
      google_maps_url: values.google_maps_url?.trim() || undefined,
      tax_percentage: normalizedTaxPercentage,
    };
    updateProperty(updatedData);
    toast.success("Property details updated successfully!");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
        <CardDescription>
          Update your hotel&apos;s information. Changes will be saved
          immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="google_maps_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps Embed URL</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Go to Google Maps, find your location, click &quot;Share&quot;, then &quot;Embed a map&quot;, and copy the src URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {google_maps_url && (
              <div>
                <Label>Map Preview</Label>
                <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg border">
                  <iframe
                    src={google_maps_url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Photos</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Add URLs to property photos, separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Taxes &amp; Fees</h3>
                <p className="text-sm text-muted-foreground">
                  Enable or disable taxes globally and set the percentage applied to bookings.
                </p>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <FormField
                  control={form.control}
                  name="tax_enabled"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Enable taxes</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        When enabled, the configured tax percentage is included in all pricing breakdowns.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax_percentage"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-48 space-y-2">
                      <FormLabel>Tax percentage</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            disabled={!taxEnabled}
                            {...field}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>Enter the rate to apply (e.g., 12 for 12%).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
