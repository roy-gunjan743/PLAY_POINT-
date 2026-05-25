import { useState } from "react";
import { Lock } from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/payment-handler";
import type { CartItem } from "@/lib/cart";

interface RazorpayButtonProps {
  amount: number;
  cartItems: CartItem[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  buttonText?: string;
  disabled?: boolean;
  className?: string;
}

export function RazorpayButton({
  amount,
  cartItems,
  onSuccess,
  onError,
  onClose,
  buttonText = "PAY",
  disabled = false,
  className = "",
}: RazorpayButtonProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [status, setStatus] = useState("");

  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  async function handlePayment() {
    if (cartItems.length === 0 || disabled || isPaying) return;

    setIsPaying(true);
    setStatus("Opening secure Razorpay checkout...");

    try {
      await initiateRazorpayPayment({
        amount,
        cartItems,
        itemCount,
        onSuccess: async (response) => {
          setStatus("Payment verified. Order placed successfully.");
          setIsPaying(false);
          onSuccess?.();
        },
        onError: (error) => {
          setStatus(error);
          setIsPaying(false);
          onError?.(error);
        },
        onClose: () => {
          setStatus("Payment popup closed.");
          setIsPaying(false);
          onClose?.();
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed. Please try again.";
      setStatus(errorMessage);
      setIsPaying(false);
      onError?.(errorMessage);
    }
  }

  return (
    <div>
      <button
        disabled={cartItems.length === 0 || disabled || isPaying}
        onClick={handlePayment}
        className={
          className ||
          "relative flex w-full items-center justify-center gap-3 bg-[#e8192c] py-5 font-['Bebas_Neue'] text-xl tracking-[0.3em] transition-all hover:-translate-y-0.5 hover:bg-[#ff2d40] hover:shadow-[0_20px_40px_rgba(232,25,44,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
        }
        style={{ clipPath: "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)" }}
      >
        <Lock className="h-4 w-4" />
        {isPaying ? "PROCESSING" : `${buttonText} Rs ${amount.toFixed(2)}`}
      </button>

      {status && (
        <div className="mt-4 border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-xs tracking-wide text-white/70">
          {status}
        </div>
      )}
    </div>
  );
}
