import { createServerFn } from "@tanstack/react-start";

type CreateRazorpayOrderInput = {
  amount: number;
  cartItems: Array<{
    id: string;
    name: string;
    qty: number;
    price: number;
  }>;
};

type VerifyRazorpayPaymentInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function toBase64(value: string) {
  return btoa(value);
}

async function hmacSha256Hex(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as CreateRazorpayOrderInput)
  .handler(async ({ data }) => {
    const keyId = requiredEnv("RAZORPAY_KEY_ID");
    const keySecret = requiredEnv("RAZORPAY_KEY_SECRET");
    const amountInPaise = Math.round(data.amount * 100);

    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      throw new Error("Invalid order amount");
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        authorization: `Basic ${toBase64(`${keyId}:${keySecret}`)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `playpoint_${Date.now()}`,
        notes: {
          item_count: String(data.cartItems.reduce((sum, item) => sum + item.qty, 0)),
          products: data.cartItems.map((item) => `${item.name} x ${item.qty}`).join(", ").slice(0, 250),
        },
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Razorpay order failed: ${message}`);
    }

    return (await response.json()) as {
      id: string;
      amount: number;
      currency: "INR";
      receipt: string;
      status: string;
    };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as VerifyRazorpayPaymentInput)
  .handler(async ({ data }) => {
    const keySecret = requiredEnv("RAZORPAY_KEY_SECRET");
    const expectedSignature = await hmacSha256Hex(
      `${data.razorpay_order_id}|${data.razorpay_payment_id}`,
      keySecret,
    );

    if (expectedSignature !== data.razorpay_signature) {
      throw new Error("Payment verification failed");
    }

    return { verified: true };
  });
