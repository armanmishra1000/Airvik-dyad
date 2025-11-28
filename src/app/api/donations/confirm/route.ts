import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import {
  getDonationByStripeSession,
  updateDonationRecord,
} from "@/lib/api/donations";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ message: "Missing session id" }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadataDonationId = session.metadata?.donation_id;
    const donation = await getDonationByStripeSession(session.id);

    if (!metadataDonationId && !donation) {
      return NextResponse.json({ message: "Donation not found" }, { status: 404 });
    }

    const resolvedDonationId = donation?.id ?? metadataDonationId!;

    if (session.payment_status === "paid" && donation?.paymentStatus !== "paid") {
      await updateDonationRecord(resolvedDonationId, {
        paymentStatus: "paid",
      });
    }

    const latestDonation = donation ?? (await getDonationByStripeSession(session.id));

    return NextResponse.json({
      donation: latestDonation,
      session: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        customer_details: session.customer_details,
      },
    });
  } catch (error) {
    console.error("Failed to confirm donation", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to confirm donation." },
      { status: 500 },
    );
  }
}
