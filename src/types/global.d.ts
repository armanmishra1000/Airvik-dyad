export {};

declare global {
  interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
    };
    handler?: (response: RazorpayCheckoutSuccess) => void;
    modal?: {
      ondismiss?: () => void;
    };
    retry?: {
      enabled: boolean;
      max_count: number;
    };
  }

  interface RazorpayCheckoutSuccess {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayCheckout {
    open: () => void;
    on: (event: string, handler: (response: unknown) => void) => void;
    close: () => void;
  }

  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}
