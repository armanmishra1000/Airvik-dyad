export interface PricingMatrixRow {
  room_type_id: string;
  rate_plan_id: string;
  day: string;
  nightly_rate: number;
  min_stay?: number | null;
  max_stay?: number | null;
  cta?: boolean | null;
  ctd?: boolean | null;
  closed: boolean;
}
