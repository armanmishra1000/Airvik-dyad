import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { donationFormSchema } from "@/lib/validators/donation";
import {
  createDonationRecord,
  updateDonationRecord,
} from "@/lib/api/donations";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = donationFormSchema.parse({
      ...body,
      amount: Number(body.amount),
      consent: Boolean(body.consent),
    });

    const amountInMinor = Math.round(parsed.amount * 100);
    const stripe = getStripeClient();

    const donation = await createDonationRecord({
      donorName: parsed.donorName.trim(),
      email: parsed.email.trim(),
      phone: parsed.phone.trim(),
      amountInMinor,
      currency: parsed.currency,
      frequency: parsed.frequency,
      message: parsed.message?.trim() || undefined,
      consent: parsed.consent,
      paymentProvider: "stripe",
      metadata: parsed.allowUpdates ? { allowUpdates: true } : {},
    });

    const headersList = await headers();
    const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate/cancel`,
      metadata: {
        donation_id: donation.id,
      },
      customer_email: donation.email,
      currency: donation.currency.toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: donation.currency.toLowerCase(),
            product_data: {
              name: parsed.frequency === "monthly" ? "Monthly Donation" : "One-time Donation",
            },
            unit_amount: amountInMinor,
          },
          quantity: 1,
        },
      ],
    });

    await updateDonationRecord(donation.id, {
      stripeSessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create donation session", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to start donation" },
      { status: 400 },
    );
  }
}
