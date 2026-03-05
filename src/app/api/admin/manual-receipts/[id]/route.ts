import { NextResponse } from "next/server";
import { z } from "zod";

import type { ManualReceipt } from "@/data/types";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { requireFeature, HttpError } from "@/lib/server/auth";

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Bank/IMPS",
  "Bhagat Ji",
  "Anurag Ji",
] as const;

const UpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  email: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.union([z.literal(""), z.string().email()]))
    .optional(),
  address: z.string().optional().nullable(),
  amount: z.coerce.number().positive().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  transactionId: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  status: z.string().optional(),
  byHand: z.string().optional().nullable(),
  creator: z.string().optional().nullable(),
  imgLink: z.string().optional().nullable(),
});

type DbManualReceipt = {
  id: string;
  slip_no: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  note: string | null;
  status: string;
  by_hand: string | null;
  creator: string | null;
  img_link: string | null;
  created_at: string;
};

function mapRow(row: DbManualReceipt): ManualReceipt {
  return {
    id: row.id,
    slipNo: row.slip_no,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    note: row.note,
    status: row.status,
    byHand: row.by_hand,
    creator: row.creator,
    imgLink: row.img_link,
    createdAt: row.created_at,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireFeature(request, "donations");
    const body = await request.json();
    const payload = UpdateSchema.parse(body);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Missing receipt id" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (payload.firstName !== undefined) updates.first_name = payload.firstName;
    if (payload.lastName !== undefined) updates.last_name = payload.lastName;
    if (payload.phone !== undefined) updates.phone = payload.phone;
    if (payload.email !== undefined) updates.email = payload.email || null;
    if (payload.address !== undefined) updates.address = payload.address || null;
    if (payload.amount !== undefined) updates.amount = payload.amount;
    if (payload.paymentMethod !== undefined) updates.payment_method = payload.paymentMethod;
    if (payload.transactionId !== undefined) updates.transaction_id = payload.transactionId || null;
    if (payload.note !== undefined) updates.note = payload.note || null;
    if (payload.status !== undefined) updates.status = payload.status;
    if (payload.byHand !== undefined) updates.by_hand = payload.byHand || null;
    if (payload.creator !== undefined) updates.creator = payload.creator || null;
    if (payload.imgLink !== undefined) updates.img_link = payload.imgLink || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("manual_receipts")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Failed to update manual receipt", error);
      return NextResponse.json(
        { message: "Unable to update receipt." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ message: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: mapRow(data as unknown as DbManualReceipt),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("Unexpected manual receipt update error", error);
    return NextResponse.json(
      { message: "Unexpected error while updating receipt." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireFeature(request, "donations");
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Missing receipt id" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("manual_receipts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete manual receipt", error);
      return NextResponse.json(
        { message: "Unable to delete receipt." },
        { status: 500 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Unexpected manual receipt delete error", error);
    return NextResponse.json(
      { message: "Unexpected error while deleting receipt." },
      { status: 500 },
    );
  }
}
