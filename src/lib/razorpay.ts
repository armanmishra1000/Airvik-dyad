import crypto from "crypto";
import Razorpay from "razorpay";

let client: Razorpay | null = null;

export function isRazorpayMockMode(): boolean {
  return String(process.env.RAZORPAY_MOCK_MODE).toLowerCase() === "true";
}

function getKeyConfig() {
  if (isRazorpayMockMode()) {
    return {
      keyId:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID ||
        "rzp_test_mock",
      keySecret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
    } as const;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return { keyId, keySecret } as const;
}

export function getRazorpayClient(): Razorpay {
  if (client) {
    return client;
  }

  if (isRazorpayMockMode()) {
    throw new Error("Razorpay client is unavailable while mock mode is enabled.");
  }

  const { keyId, keySecret } = getKeyConfig();
  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (isRazorpayMockMode()) {
    return true;
  }
  const { keySecret } = getKeyConfig();
  const payload = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
  return expectedSignature === params.signature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  if (isRazorpayMockMode()) {
    return true;
  }
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET environment variable.");
  }

  const computed = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return computed === signature;
}
