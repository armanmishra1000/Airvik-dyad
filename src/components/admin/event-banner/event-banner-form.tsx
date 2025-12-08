"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";

import type { EventBanner } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/image-upload";
import { authorizedFetch } from "@/lib/auth/client-session";

const formSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(500).optional(),
    imageUrl: z.string().trim().min(1, "Image is required"),
    isActive: z.boolean(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
  })
  .refine(
    (values) => {
      if (!values.startsAt || !values.endsAt) return true;
      return new Date(values.startsAt) <= new Date(values.endsAt);
    },
    { path: ["startsAt"], message: "Start date must be before end date" }
  );

type EventBannerFormValues = z.infer<typeof formSchema>;

const toLocalInputValue = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const toIsoOrUndefined = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

type Props = {
  initialBanner: EventBanner | null;
};

export function EventBannerForm({ initialBanner }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues: EventBannerFormValues = useMemo(
    () => ({
      id: initialBanner?.id,
      title: initialBanner?.title ?? "",
      description: initialBanner?.description ?? "",
      imageUrl: initialBanner?.imageUrl ?? "",
      isActive: initialBanner?.isActive ?? true,
      startsAt: toLocalInputValue(initialBanner?.startsAt),
      endsAt: toLocalInputValue(initialBanner?.endsAt),
    }),
    [initialBanner]
  );

  const form = useForm<EventBannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = async (values: EventBannerFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...values,
        description: values.description?.trim() || undefined,
        startsAt: toIsoOrUndefined(values.startsAt),
        endsAt: toIsoOrUndefined(values.endsAt),
      };

      const response = await authorizedFetch("/api/admin/event-banner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = data?.message ?? "Unable to save banner";
        throw new Error(message);
      }

      const saved = data.data as EventBanner;
      form.reset({
        id: saved.id,
        title: saved.title,
        description: saved.description ?? "",
        imageUrl: saved.imageUrl,
        isActive: saved.isActive,
        startsAt: toLocalInputValue(saved.startsAt),
        endsAt: toLocalInputValue(saved.endsAt),
      });
      toast.success("Event banner saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save banner";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Banner content</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner image</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>Use a landscape image for best results.</FormDescription>
                  <FormMessage />
                  {field.value && (
                    <div className="mt-4 overflow-hidden rounded-xl border">
                      <Image
                        src={field.value}
                        alt="Banner preview"
                        width={900}
                        height={500}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Upcoming event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Enable banner</FormLabel>
                      <FormDescription>When enabled, it will appear on the homepage.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a concise invitation or key details"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Show from</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Optional start date/time to begin showing.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hide after</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Optional end date/time to stop showing.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save banner"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(defaultValues)}
                disabled={isSaving}
              >
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
