import type {
  Donation,
  DonationFrequency,
  DonationStats,
  DonationStatus,
} from "@/data/types";
import { createServerSupabaseClient } from "@/integrations/supabase/server";

type DbDonation = {
  id: string;
  donor_name: string;
  email: string;
  phone: string;
  amount_in_minor: number;
  currency: string;
  frequency: DonationFrequency;
  message: string | null;
  consent: boolean;
  payment_provider: string;
  payment_status: DonationStatus;
  stripe_session_id: string | null;
  upi_reference: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type DbDonationStats = {
  total_amount_in_minor: number | null;
  total_donations: number | null;
  monthly_donations: number | null;
  last_donation_at: string | null;
};

export type CreateDonationInput = {
  donorName: string;
  email: string;
  phone: string;
  amountInMinor: number;
  currency: string;
  frequency: DonationFrequency;
  message?: string;
  consent: boolean;
  paymentProvider: string;
  paymentStatus?: DonationStatus;
  stripeSessionId?: string;
  upiReference?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateDonationInput = Partial<
  Pick<
    CreateDonationInput,
    | "donorName"
    | "email"
    | "phone"
    | "amountInMinor"
    | "currency"
    | "frequency"
    | "message"
    | "consent"
    | "paymentProvider"
    | "paymentStatus"
    | "stripeSessionId"
    | "upiReference"
    | "metadata"
  >
>;

const fromDbDonation = (row: DbDonation): Donation => ({
  id: row.id,
  donorName: row.donor_name,
  email: row.email,
  phone: row.phone,
  amountInMinor: row.amount_in_minor,
  currency: row.currency,
  frequency: row.frequency,
  message: row.message ?? undefined,
  consent: row.consent,
  paymentProvider: row.payment_provider,
  paymentStatus: row.payment_status,
  stripeSessionId: row.stripe_session_id ?? undefined,
  upiReference: row.upi_reference ?? undefined,
  metadata: row.metadata ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const fromDbStats = (row: DbDonationStats | null): DonationStats => ({
  totalAmountInMinor: row?.total_amount_in_minor ?? 0,
  totalDonations: row?.total_donations ?? 0,
  monthlyDonations: row?.monthly_donations ?? 0,
  lastDonationAt: row?.last_donation_at ?? undefined,
});

export async function createDonationRecord(input: CreateDonationInput): Promise<Donation> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("donations")
    .insert({
      donor_name: input.donorName,
      email: input.email,
      phone: input.phone,
      amount_in_minor: input.amountInMinor,
      currency: input.currency,
      frequency: input.frequency,
      message: input.message ?? null,
      consent: input.consent,
      payment_provider: input.paymentProvider,
      payment_status: input.paymentStatus ?? "pending",
      stripe_session_id: input.stripeSessionId ?? null,
      upi_reference: input.upiReference ?? null,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create donation: ${error.message}`);
  }

  return fromDbDonation(data as DbDonation);
}

export async function updateDonationRecord(
  donationId: string,
  input: UpdateDonationInput,
): Promise<Donation> {
  const supabase = createServerSupabaseClient();
  const payload: Record<string, unknown> = {};

  if (typeof input.donorName !== "undefined") payload.donor_name = input.donorName;
  if (typeof input.email !== "undefined") payload.email = input.email;
  if (typeof input.phone !== "undefined") payload.phone = input.phone;
  if (typeof input.amountInMinor !== "undefined") payload.amount_in_minor = input.amountInMinor;
  if (typeof input.currency !== "undefined") payload.currency = input.currency;
  if (typeof input.frequency !== "undefined") payload.frequency = input.frequency;
  if (typeof input.message !== "undefined") payload.message = input.message ?? null;
  if (typeof input.consent !== "undefined") payload.consent = input.consent;
  if (typeof input.paymentProvider !== "undefined") payload.payment_provider = input.paymentProvider;
  if (typeof input.paymentStatus !== "undefined") payload.payment_status = input.paymentStatus;
  if (typeof input.stripeSessionId !== "undefined") payload.stripe_session_id = input.stripeSessionId;
  if (typeof input.upiReference !== "undefined") payload.upi_reference = input.upiReference;
  if (typeof input.metadata !== "undefined") payload.metadata = input.metadata;

  const { data, error } = await supabase
    .from("donations")
    .update(payload)
    .eq("id", donationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update donation: ${error.message}`);
  }

  return fromDbDonation(data as DbDonation);
}

export async function getDonationByStripeSession(
  sessionId: string,
): Promise<Donation | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load donation: ${error.message}`);
  }

  return data ? fromDbDonation(data as DbDonation) : null;
}

export async function getDonationStats(): Promise<DonationStats> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("donation_stats").select("*").maybeSingle();

  if (error) {
    console.warn("Unable to read donation stats, returning defaults", error.message);
    return fromDbStats(null);
  }

  return fromDbStats(data as DbDonationStats | null);
}
