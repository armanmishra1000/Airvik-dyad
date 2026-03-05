"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { FileText, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useDataContext } from "@/context/data-context";
import { authorizedFetch } from "@/lib/auth/client-session";
import type {
  Guest,
  Reservation,
  ReservationPaymentMethod,
  Room,
  RoomType,
} from "@/data/types";

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Bank/IMPS",
  "Bhagat Ji",
  "Anurag Ji",
] as const;

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  phone: z.string().min(10, "Phone must be at least 10 characters."),
  email: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z.union([
        z.literal(""),
        z.string().email("Please enter a valid email address."),
      ]),
    ),
  address: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive."),
  paymentMethod: z.enum(PAYMENT_METHODS),
  transactionId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManualReceiptPage() {
  const { property } = useDataContext();
  const [downloading, setDownloading] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      amount: 0,
      paymentMethod: "Cash",
      transactionId: "",
    },
  });

  function buildReceiptData(values: FormValues) {
    const now = new Date().toISOString();
    const bookingId = crypto.randomUUID();
    const roomTypeId = crypto.randomUUID();
    const roomId = crypto.randomUUID();
    const amount = Number(values.amount);

    const guest: Guest = {
      id: crypto.randomUUID(),
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || "",
      phone: values.phone,
      address: values.address || undefined,
    };

    const roomType: RoomType = {
      id: roomTypeId,
      name: "Donation",
      description: "",
      maxOccupancy: 1,
      bedTypes: [],
      price: amount,
      amenities: [],
      photos: [],
      isVisible: false,
    };

    const room: Room = {
      id: roomId,
      roomNumber: "-",
      roomTypeId,
      status: "Clean",
    };

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      bookingId,
      guestId: guest.id,
      roomId,
      ratePlanId: null,
      checkInDate: now,
      checkOutDate: now,
      numberOfGuests: 1,
      status: "Confirmed",
      folio: [
        {
          id: crypto.randomUUID(),
          description: `Donation – ${values.paymentMethod}`,
          amount: -amount,
          timestamp: now,
          paymentMethod: values.paymentMethod,
          externalReference: values.transactionId || null,
        },
      ],
      totalAmount: amount,
      bookingDate: now,
      source: "reception",
      paymentMethod: values.paymentMethod as ReservationPaymentMethod,
      adultCount: 1,
      childCount: 0,
      taxEnabledSnapshot: false,
      taxRateSnapshot: 0,
    };

    return {
      reservations: [reservation],
      guest,
      property,
      rooms: [room],
      roomTypes: [roomType],
    };
  }

  async function handleDownload() {
    const valid = await form.trigger();
    if (!valid) return;

    setDownloading(true);
    try {
      const data = buildReceiptData(form.getValues());
      const { generateInvoice } = await import("@/lib/invoice/generate-invoice");
      await generateInvoice(data);
      toast.success("Receipt downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate receipt.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleWhatsApp() {
    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();
    setSending(true);
    try {
      const data = buildReceiptData(values);
      const { generateInvoice } = await import("@/lib/invoice/generate-invoice");
      const blob = await generateInvoice(data, { returnBlob: true });
      if (!blob) {
        toast.error("Failed to generate receipt PDF.");
        return;
      }

      const formData = new FormData();
      formData.append("phone", values.phone);
      formData.append(
        "file",
        new File([blob], "Donation_Receipt.pdf", { type: "application/pdf" }),
      );

      const res = await authorizedFetch(
        "/api/admin/send-invoice-whatsapp",
        { method: "POST", body: formData },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          (body as { message?: string } | null)?.message || "Send failed",
        );
      }

      toast.success("Receipt sent on WhatsApp.");
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to send receipt.",
      );
    } finally {
      setSending(false);
    }
  }

  const busy = downloading || sending;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manual Receipt</h1>
        <p className="text-sm text-muted-foreground">
          Generate a donation receipt for walk-in or phone bookings.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
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
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
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
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (INR)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0"
                      type="number"
                      min={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Transaction ID */}
          <FormField
            control={form.control}
            name="transactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction ID (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Transaction / reference ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              onClick={handleDownload}
              disabled={busy}
              className="flex-1"
            >
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleWhatsApp}
              disabled={busy}
              className="flex-1"
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send on WhatsApp
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
