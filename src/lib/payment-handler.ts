import { createRazorpayOrder, verifyRazorpayPayment } from "./razorpay";
import type { CartItem } from "./cart";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  theme: { color: string };
  modal: { ondismiss: () => void };
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface InitiatePaymentOptions {
  amount: number;
  cartItems: CartItem[];
  onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => Promise<void>;
  onError: (error: string) => void;
  onClose: () => void;
  itemCount: number;
}

export async function initiateRazorpayPayment(options: InitiatePaymentOptions): Promise<void> {
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!razorpayKeyId) {
    throw new Error("Razorpay key not configured. Add VITE_RAZORPAY_KEY_ID to .env");
  }

  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded || !window.Razorpay) {
    throw new Error("Failed to load Razorpay checkout. Please try again.");
  }

  const order = await createRazorpayOrder({
    data: {
      amount: options.amount,
      cartItems: options.cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
    },
  });

  const checkout = new window.Razorpay({
    key: razorpayKeyId,
    amount: order.amount,
    currency: "INR",
    name: "PLAYPOINT",
    description: `${options.itemCount} jersey item${options.itemCount === 1 ? "" : "s"}`,
    order_id: order.id,
    theme: { color: "#e8192c" },
    modal: {
      ondismiss: options.onClose,
    },
    handler: async (response) => {
      try {
        await verifyRazorpayPayment({ data: response });
        await options.onSuccess(response);
      } catch (error) {
        options.onError(error instanceof Error ? error.message : "Payment verification failed");
      }
    },
  });

  checkout.open();
}
