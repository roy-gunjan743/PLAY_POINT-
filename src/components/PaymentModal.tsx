import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RazorpayButton } from "./RazorpayButton";
import type { CartItem } from "@/lib/cart";

interface PaymentModalProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

export function PaymentModal({ isOpen, items, onClose, onSuccess, amount }: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/10 bg-[#050508] text-white">
        <DialogHeader>
          <DialogTitle className="font-['Bebas_Neue'] text-2xl tracking-wider">SECURE PAYMENT</DialogTitle>
          <DialogDescription className="text-white/60">
            Complete your order securely with Razorpay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm opacity-70">Items:</span>
              <span className="font-semibold">{items.reduce((sum, item) => sum + item.qty, 0)} items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-70">Total Amount:</span>
              <span className="font-['Bebas_Neue'] text-2xl text-[#e8192c]">Rs {amount.toFixed(2)}</span>
            </div>
          </div>

          <RazorpayButton
            amount={amount}
            cartItems={items}
            onSuccess={onSuccess}
            onClose={onClose}
            buttonText="PAY"
            className="relative flex w-full items-center justify-center gap-3 bg-[#e8192c] py-4 font-['Bebas_Neue'] text-lg tracking-[0.3em] transition-all hover:bg-[#ff2d40] disabled:opacity-40"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
