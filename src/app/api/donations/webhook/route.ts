import { NextRequest, NextResponse } from "next/server";
import { getDonationByOrderId, updateDonationRecord } from "@/lib/api/donations";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-razorpay-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ message: "Missing webhook signature" }, { status: 400 });
  }

  try {
    const isValid = verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(payload);
    const payment = event?.payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;
    const status = payment?.status;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const donation = await getDonationByOrderId(orderId);
    if (!donation) {
      return NextResponse.json({ received: true });
    }

    const updates: Parameters<typeof updateDonationRecord>[1] = {
      razorpayPaymentId: paymentId ?? undefined,
    };

    if (status === "captured" || status === "authorized") {
      updates.paymentStatus = "paid";
    } else if (status === "failed") {
      updates.paymentStatus = "failed";
    } else if (status === "refunded") {
      updates.paymentStatus = "refunded";
    }

    await updateDonationRecord(donation.id, updates);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error", error);
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 400 });
  }
}
