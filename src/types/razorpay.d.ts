declare module "razorpay" {
  export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt?: string | null;
    offer_id?: string | null;
    status: string;
    attempts: number;
    notes?: Record<string, string> | null;
    created_at: number;
  }

  export interface CreateOrderRequest {
    amount: number;
    currency: string;
    receipt?: string;
    payment_capture?: 0 | 1;
    notes?: Record<string, string>;
  }

  export default class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(params: CreateOrderRequest): Promise<RazorpayOrder>;
    };
  }
}
