import { VIKBOOKING_SOURCE } from "./constants";
import type { RpcFolioItemPayload, RpcImportRow, StoredImportPayload } from "./types";
import { extractStoredPayload } from "./jobs";
import type { ImportJobEntry } from "@/data/types";

type BuildRowsArgs = {
  entries: ImportJobEntry[];
  roomMap: Map<string, string>;
  actorUserId: string;
  defaultRatePlanId?: string | null;
};

export function buildRpcRows({
  entries,
  roomMap,
  actorUserId,
  defaultRatePlanId = null,
}: BuildRowsArgs): RpcImportRow[] {
  return entries.map((entry, index) => {
    const payload = extractStoredPayload(entry);
    const normalizedLabel = payload.roomLabel?.trim() ?? "";
    const roomId = roomMap.get(normalizedLabel);
    if (!roomId) {
      throw new Error(`Missing mapped room for label "${payload.roomLabel}"`);
    }

    const notes = buildNotes(payload);
    const taxEnabled = payload.totalTaxes > 0;
    const netAmount = Math.max(0, payload.totalAmount - payload.totalTaxes);
    const taxRate = taxEnabled && netAmount > 0 ? payload.totalTaxes / netAmount : 0;
    const folioItems = buildFolioItems(payload, index);

    return {
      job_entry_id: entry.id,
      guest: {
        first_name: payload.guest.firstName,
        last_name: payload.guest.lastName,
        email: payload.guest.email,
        phone: payload.guest.phone,
      },
      reservation: {
        booking_id: payload.bookingId,
        room_id: roomId,
        rate_plan_id: defaultRatePlanId,
        check_in_date: payload.checkInDate,
        check_out_date: payload.checkOutDate,
        number_of_guests: payload.people.total,
        status: payload.status,
        notes,
        total_amount: payload.totalAmount,
        booking_date: payload.bookingDate,
        source: VIKBOOKING_SOURCE,
        payment_method: payload.paymentMethod,
        adult_count: payload.people.adults,
        child_count: payload.people.children,
        tax_enabled_snapshot: taxEnabled,
        tax_rate_snapshot: Number.isFinite(taxRate) ? Number(taxRate.toFixed(4)) : 0,
        external_source: VIKBOOKING_SOURCE,
        external_id: payload.externalId,
        external_metadata: {
          rawStatus: payload.statusRaw,
          rawPaymentMethod: payload.paymentMethodRaw,
          roomLabel: payload.roomLabel,
          createdBy: payload.createdBy,
          originalTotals: {
            total: payload.totalAmount,
            paid: payload.totalPaid,
            taxes: payload.totalTaxes,
          },
        },
      },
      folio_items: folioItems,
      activity: {
        actor_user_id: actorUserId,
        actor_role: "system",
        actor_name: "VikBooking Import",
        details: `Imported booking ${payload.externalId}`,
        metadata: {
          roomLabel: payload.roomLabel,
          bookingId: payload.bookingId,
        },
      },
    };
  });
}

function buildNotes(payload: StoredImportPayload): string | null {
  const parts = [] as string[];
  if (payload.notes) parts.push(payload.notes);
  if (payload.specialRequests) {
    parts.push(`Special Requests:\n${payload.specialRequests}`);
  }
  return parts.length ? parts.join("\n\n") : null;
}

function buildFolioItems(
  payload: StoredImportPayload,
  indexSeed: number
): RpcFolioItemPayload[] {
  const items: RpcFolioItemPayload[] = [];

  payload.optionLines.forEach((line, idx) => {
    items.push({
      description: line.description,
      amount: line.amount,
      payment_method: null,
      timestamp: payload.bookingDate,
      external_source: VIKBOOKING_SOURCE,
      external_reference: `option-${payload.externalId}-${indexSeed}-${idx}`,
      external_metadata: { type: line.type },
    });
  });

  if (payload.taxLine) {
    items.push({
      description: payload.taxLine.description,
      amount: payload.taxLine.amount,
      payment_method: null,
      timestamp: payload.bookingDate,
      external_source: VIKBOOKING_SOURCE,
      external_reference: `tax-${payload.externalId}-${indexSeed}`,
      external_metadata: { type: payload.taxLine.type },
    });
  }

  payload.paymentLines.forEach((line, idx) => {
    items.push({
      description: line.description,
      amount: line.amount,
      payment_method: payload.paymentMethod,
      timestamp: payload.bookingDate,
      external_source: VIKBOOKING_SOURCE,
      external_reference: `payment-${payload.externalId}-${indexSeed}-${idx}`,
      external_metadata: { type: line.type },
    });
  });

  return items;
}
