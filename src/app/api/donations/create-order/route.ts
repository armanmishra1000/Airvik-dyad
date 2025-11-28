import { NextRequest, NextResponse } from "next/server";
import { donationFormSchema } from "@/lib/validators/donation";
import { createDonationRecord, updateDonationRecord } from "@/lib/api/donations";
import { getRazorpayClient, isRazorpayMockMode } from "@/lib/razorpay";
import type { DonationReceipt } from "@/lib/donations/receipt-storage";

function buildReceipt(params: {
  donationId: string;
  donation: {
    amountInMinor: number;
    currency: string;
    frequency: "one_time" | "monthly";
    email: string;
    message?: string;
  };
  paymentId: string;
}): DonationReceipt {
  return {
    donationId: params.donationId,
    amountInMinor: params.donation.amountInMinor,
    currency: params.donation.currency,
    frequency: params.donation.frequency,
    email: params.donation.email,
    message: params.donation.message,
    paymentId: params.paymentId,
    timestamp: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = donationFormSchema.parse({
      ...body,
      amount: Number(body.amount),
      consent: Boolean(body.consent),
    });

    const mockMode = isRazorpayMockMode();
    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!publicKey && !mockMode) {
      throw new Error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable.");
    }

    const amountInMinor = Math.round(parsed.amount * 100);
    if (amountInMinor <= 0) {
      throw new Error("Donation amount must be greater than zero.");
    }

    const donation = await createDonationRecord({
      donorName: parsed.donorName.trim(),
      email: parsed.email.trim(),
      phone: parsed.phone.trim(),
      amountInMinor,
      currency: parsed.currency.toUpperCase(),
      frequency: parsed.frequency,
      message: parsed.message?.trim() || undefined,
      consent: parsed.consent,
      paymentProvider: "razorpay",
      paymentStatus: mockMode ? "paid" : undefined,
      metadata: parsed.allowUpdates ? { allowUpdates: true } : {},
    });

    if (mockMode) {
      const mockOrderId = `order_mock_${donation.id}`;
      const mockPaymentId = `pay_mock_${Math.random().toString(36).slice(2, 10)}`;
      await updateDonationRecord(donation.id, {
        razorpayOrderId: mockOrderId,
        razorpayPaymentId: mockPaymentId,
        paymentStatus: "paid",
      });

      const receipt = buildReceipt({
        donationId: donation.id,
        donation: {
          amountInMinor: donation.amountInMinor,
          currency: donation.currency,
          frequency: donation.frequency,
          email: donation.email,
          message: donation.message,
        },
        paymentId: mockPaymentId,
      });

      return NextResponse.json({
        mock: true,
        donation: {
          id: donation.id,
          donorName: donation.donorName,
          email: donation.email,
          phone: donation.phone,
          amountInMinor: donation.amountInMinor,
          currency: donation.currency,
          frequency: donation.frequency,
          message: donation.message,
        },
        mockReceipt: receipt,
      });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountInMinor,
      currency: donation.currency,
      receipt: `donation_${donation.id}`,
      notes: {
        donation_id: donation.id,
        frequency: donation.frequency,
      },
      payment_capture: 1,
    });

    await updateDonationRecord(donation.id, {
      razorpayOrderId: order.id,
    });

    return NextResponse.json({
      keyId: publicKey,
      order,
      donation: {
        id: donation.id,
        donorName: donation.donorName,
        email: donation.email,
        phone: donation.phone,
        amountInMinor: donation.amountInMinor,
        currency: donation.currency,
        frequency: donation.frequency,
        message: donation.message,
      },
    });
  } catch (error) {
    console.error("Failed to create Razorpay order", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to create order" },
      { status: 400 },
    );
  }
}
