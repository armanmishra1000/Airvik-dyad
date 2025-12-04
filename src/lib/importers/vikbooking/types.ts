import type {
  ReservationPaymentMethod,
  ReservationStatus,
} from "@/data/types";

export type ImportIssueSeverity = "error" | "warning";

export interface ImportIssue {
  rowNumber: number;
  field: string;
  message: string;
  severity: ImportIssueSeverity;
}

export interface VikBookingGuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  country?: string;
  addressLines?: string[];
}

export interface PeopleBreakdown {
  adults: number;
  children: number;
  total: number;
}

export type ExtraLineType = "option" | "payment" | "tax";

export interface VikBookingExtraLine {
  type: ExtraLineType;
  description: string;
  amount: number;
}

export interface VikBookingNormalizedRow {
  rowNumber: number;
  bookingId: string;
  externalId: string;
  confirmationNumber?: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomLabel: string;
  roomNumber?: string | null;
  roomLabelDisplay?: string | null;
  guest: VikBookingGuestInfo;
  people: PeopleBreakdown;
  email?: string;
  phone?: string;
  specialRequests?: string;
  notes?: string;
  createdBy?: string;
  status: ReservationStatus;
  statusRaw: string;
  paymentMethod: ReservationPaymentMethod;
  paymentMethodRaw?: string;
  totalAmount: number;
  totalPaid: number;
  totalTaxes: number;
  optionLines: VikBookingExtraLine[];
  paymentLines: VikBookingExtraLine[];
  taxLine?: VikBookingExtraLine;
  metadata: Record<string, unknown>;
  raw: Record<string, string>;
}

export interface ParseResultSummary {
  rows: VikBookingNormalizedRow[];
  issues: ImportIssue[];
  uniqueRoomLabels: string[];
  hash: string;
}

export type StoredImportPayload = VikBookingNormalizedRow;

export interface RpcGuestPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface RpcReservationPayload {
  booking_id: string;
  room_id: string;
  rate_plan_id: string | null | undefined;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  status: ReservationStatus;
  notes: string | null;
  total_amount: number;
  booking_date: string;
  source: string;
  payment_method: ReservationPaymentMethod;
  adult_count: number;
  child_count: number;
  tax_enabled_snapshot: boolean;
  tax_rate_snapshot: number;
  external_source?: string;
  external_id?: string;
  external_metadata?: Record<string, unknown> | null;
}

export interface RpcFolioItemPayload {
  description: string;
  amount: number;
  payment_method?: string | null;
  timestamp: string;
  external_source?: string | null;
  external_reference?: string | null;
  external_metadata?: Record<string, unknown> | null;
}

export interface RpcImportRow {
  job_entry_id: string;
  guest: RpcGuestPayload;
  reservation: RpcReservationPayload;
  folio_items: RpcFolioItemPayload[];
  activity: {
    actor_user_id: string;
    actor_role: string;
    actor_name: string;
    details: string;
    metadata?: Record<string, unknown>;
  };
}

export type RoomMapping = Record<string, string>;

export interface SkipReportEntry {
  entryId: string;
  rowNumber: number;
  bookingId: string;
  roomLabel?: string | null;
  guestName?: string | null;
  reason: string;
  reasonCode?: string;
  skippedAt: string;
}
