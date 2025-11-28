import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { updateDonationRecord } from "@/lib/api/donations";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: "Invalid webhook configuration" }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const donationId = session.metadata?.donation_id;
      if (donationId) {
        await updateDonationRecord(donationId, { paymentStatus: "paid" });
      }
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const donationId = session.metadata?.donation_id;
      if (donationId) {
        await updateDonationRecord(donationId, { paymentStatus: "failed" });
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const donationId = charge.metadata?.donation_id;
      if (donationId) {
        await updateDonationRecord(donationId, { paymentStatus: "refunded" });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 400 });
  }
}
