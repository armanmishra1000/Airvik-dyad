import { format } from "date-fns";

import type { AdminActivityLog } from "@/data/types";

const fallbackCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const FIELD_LABEL_OVERRIDES: Record<string, string> = {
  checkInDate: "check-in date",
  checkOutDate: "check-out date",
  guestId: "guest",
  guestPhoneNumber: "guest phone number",
  phone: "phone number",
  roomTypeId: "room type",
  roomIds: "rooms",
  roomNumber: "room number",
  status: "status",
};

const ACTION_SUMMARY_MAP: Record<string, (log: AdminActivityLog) => string> = {
  reservation_updated: () => "Reservation details updated",
  reservation_status_updated: () => "Reservation status updated",
  room_updated: () => "Room information updated",
  room_type_updated: () => "Room type information updated",
  room_category_updated: () => "Room category updated",
  guest_updated: () => "Guest profile updated",
  rate_plan_updated: () => "Rate plan updated",
  property_updated: () => "Property settings updated",
  role_updated: () => "Role permissions updated",
  user_updated: () => "User details updated",
};

const formatFieldLabel = (fieldName: string) => {
  const trimmed = fieldName.trim();
  if (!trimmed) return "";
  const override = FIELD_LABEL_OVERRIDES[trimmed];
  if (override) return override;
  const normalized = trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
  return normalized;
};

const describeChangedFields = (fields: string[] | undefined) => {
  if (!fields || fields.length === 0) return undefined;
  const unique = Array.from(new Set(fields.map((field) => field.trim()).filter(Boolean)));
  if (unique.length === 0) return undefined;
  const labels = unique.map((field) => formatFieldLabel(field)).filter(Boolean);
  if (labels.length === 0) return undefined;
  const MAX_FIELDS = 4;
  const visible = labels.slice(0, MAX_FIELDS);
  const remainingCount = labels.length - visible.length;
  const base = visible.join(", ");
  return remainingCount > 0 ? `${base}, +${remainingCount} more` : base;
};

const humanize = (value: string | null | undefined) => {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
    .trim();
};

const readStringMetadata = (metadata: Record<string, unknown> | null | undefined, keys: string[]) => {
  if (!metadata) return undefined;
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

const readArrayMetadata = (metadata: Record<string, unknown> | null | undefined, key: string) => {
  if (!metadata) return undefined;
  const value = metadata[key];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string") as string[];
  }
  return undefined;
};

export const formatActivityTimestamp = (value: string, pattern = "MMM d, yyyy • h:mm a") => {
  try {
    return format(new Date(value), pattern);
  } catch {
    return value;
  }
};

export const formatActivityActor = (log: AdminActivityLog) => {
  const actorName = log.actorName?.trim() ?? "Unknown user";
  const actorRole = log.actorRole?.trim() ?? "Unknown role";
  return `${actorName} • ${actorRole}`;
};

export const formatActivityResource = (log: AdminActivityLog) => {
  return (
    log.entityLabel?.trim() ||
    log.entityId?.trim() ||
    humanize(log.entityType) ||
    humanize(log.section) ||
    "—"
  );
};

export const formatActivitySummary = (log: AdminActivityLog) => {
  const mappedSummary = ACTION_SUMMARY_MAP[log.action]?.(log);
  if (mappedSummary) {
    return mappedSummary;
  }
  if (log.details && log.details.trim().length > 0) {
    return log.details.trim();
  }
  const metadataSummary = readStringMetadata(log.metadata, ["summary", "description", "message"]);
  if (metadataSummary) {
    return metadataSummary;
  }
  return humanize(log.action) || log.action;
};

type FormatActivityOutcomeOptions = {
  formatAmount?: (amount: number) => string;
};

export const formatActivityOutcome = (
  log: AdminActivityLog,
  options?: FormatActivityOutcomeOptions
) => {
  const changedFieldsDescription = describeChangedFields(readArrayMetadata(log.metadata, "changedFields"));
  if (changedFieldsDescription) {
    return `Updated: ${changedFieldsDescription}`;
  }
  const metadataOutcome = readStringMetadata(log.metadata, ["status", "outcome", "result"]);
  if (metadataOutcome) {
    return metadataOutcome;
  }

  if (typeof log.amountMinor === "number") {
    const formatAmount = options?.formatAmount ?? ((amount: number) => fallbackCurrencyFormatter.format(amount));
    return formatAmount(log.amountMinor / 100);
  }

  return "Completed";
};
