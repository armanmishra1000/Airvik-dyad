import type {
  ReservationPaymentMethod,
  ReservationStatus,
} from "@/data/types";

export const VIKBOOKING_SOURCE = "vikbooking" as const;
export const IMPORT_CHUNK_SIZE = 250;

export const REQUIRED_COLUMNS = [
  "Booking ID",
  "Date",
  "Check-in",
  "Check-out",
  "Room",
  "People",
  "Customer Information",
  "Booking Status",
  "Total",
] as const;

const statusDefaults: Record<string, ReservationStatus> = {
  confirmed: "Confirmed",
  standby: "Standby",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  checkedin: "Checked-in",
  "checked-in": "Checked-in",
  checkedout: "Checked-out",
  "checked-out": "Checked-out",
  noshow: "No-show",
  "no show": "No-show",
  closure: "Cancelled",
  tentative: "Tentative",
};

export const STATUS_MAP: Record<string, ReservationStatus> = statusDefaults;

const paymentDefaults: Record<string, ReservationPaymentMethod> = {
  cash: "Cash",
  "cash payment": "Cash",
  upi: "Pay with UPI",
  "pay with upi": "Pay with UPI",
  "upi transfer": "Pay with UPI",
  transfer: "Transfer",
  "bank transfer": "Transfer",
  "net banking": "Transfer",
  "card on file": "Card on file",
  "credit card": "Card on file",
  "debit card": "Card on file",
  online: "Card on file",
  razorpay: "Card on file",
  "pay later": "Not specified",
  "not specified": "Not specified",
  "not relevant": "Not relevant",
};

export const PAYMENT_METHOD_MAP: Record<string, ReservationPaymentMethod> =
  paymentDefaults;

export const DEFAULT_PAYMENT_METHOD: ReservationPaymentMethod = "Not specified";
export const SUMMARY_PREVIEW_LIMIT = 25;
