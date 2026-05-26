import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  CreditCard,
  Lock,
  Minus,
  Plus,
  QrCode,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { loadCart, saveCart, type CartItem } from "@/lib/cart";
import { RazorpayButton } from "@/components/RazorpayButton";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - PLAYPOINT" },
      { name: "description", content: "Secure checkout for your authentic jersey order." },
    ],
  }),
  component: Checkout,
});

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold tracking-[0.3em] opacity-50">{label}</span>
      <input
        {...props}
        className="w-full border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm tracking-wide outline-none transition placeholder:opacity-30 focus:border-[#e8192c] focus:bg-white/[0.05]"
      />
    </label>
  );
}

function Checkout() {
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(loadCart());
  }, []);

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 0;
  const tax = +(subtotal * 0.18).toFixed(2);
  const total = subtotal + shipping + tax;

  function updateCart(nextCart: CartItem[]) {
    setCart(nextCart);
    saveCart(nextCart);
  }

  function addItem(id: string) {
    updateCart(cart.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
  }

  function removeItem(id: string) {
    updateCart(
      cart
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  }

  function handlePaymentSuccess() {
    updateCart([]);
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#050508] text-[#f5f5f0]"
      style={{ fontFamily: "Barlow, system-ui, sans-serif" }}
    >
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/60 px-6 py-5 backdrop-blur-xl md:px-12">
        <Link to="/" className="font-['Bebas_Neue'] text-2xl tracking-[0.3em] md:text-3xl">
          PLAY<span className="text-[#e8192c]">POINT</span>
        </Link>
        <div className="hidden items-center gap-2 text-[11px] font-semibold tracking-[0.3em] opacity-70 md:flex">
          <Lock className="h-3.5 w-3.5 text-[#3dd17f]" />
          SECURE CHECKOUT
        </div>
        <Link to="/" className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.3em] opacity-70 hover:opacity-100">
          <ChevronLeft className="h-4 w-4" /> BACK
        </Link>
      </nav>

      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 20% 10%, rgba(232,25,44,0.12), transparent 60%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(255,199,44,0.08), transparent 60%), linear-gradient(180deg, #050508, #0a0a14)",
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-1/2"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0, transparent 1px, transparent 70px), repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0, transparent 1px, transparent 70px)",
            transform: "perspective(700px) rotateX(62deg)",
            transformOrigin: "bottom",
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
          }}
        />
      </div>

      <main className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 md:px-12">
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3 text-[11px] font-bold tracking-[0.4em] text-[#e8192c]">
            <span className="h-px w-8 bg-[#e8192c]" /> FINAL WHISTLE
          </div>
          <h1 className="font-['Bebas_Neue'] text-[clamp(56px,8vw,110px)] leading-[0.85] tracking-wider">
            CHECK<span className="text-[#e8192c]">OUT</span>
          </h1>
        </div>

        <div className="mb-12 flex items-center gap-4 overflow-x-auto">
          {["DETAILS", "PAYMENT", "CONFIRM"].map((label, index) => {
            const number = index + 1;
            const active = step === number;
            const done = step > number;
            return (
              <div key={label} className="flex shrink-0 items-center gap-4">
                <button onClick={() => setStep(number)} className="flex items-center gap-3">
                  <span
                    className={`grid h-8 w-8 place-items-center font-['Bebas_Neue'] text-lg transition ${
                      active
                        ? "bg-[#e8192c] text-white"
                        : done
                          ? "bg-[#3dd17f] text-black"
                          : "border border-white/10 bg-white/5 text-white/50"
                    }`}
                    style={{ clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }}
                  >
                    {done ? <Check className="h-4 w-4" /> : number}
                  </span>
                  <span className={`text-[11px] font-bold tracking-[0.3em] ${active ? "text-white" : "opacity-50"}`}>
                    {label}
                  </span>
                </button>
                {index < 2 && <span className="h-px w-12 bg-white/10" />}
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <section className="relative border border-white/10 bg-white/[0.02] p-8 backdrop-blur">
              <div className="absolute left-0 top-0 h-px w-16 bg-[#e8192c]" />
              <h2 className="mb-1 font-['Bebas_Neue'] text-3xl tracking-wider">SHIPPING DETAILS</h2>
              <p className="mb-6 text-xs opacity-50">Where should we send your kit?</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="FIRST NAME" placeholder="Sunil" />
                <Field label="LAST NAME" placeholder="Chhetri" />
                <Field label="EMAIL" type="email" placeholder="you@playpoint.in" />
                <Field label="PHONE" type="tel" placeholder="+91 98765 43210" />
                <div className="sm:col-span-2">
                  <Field label="ADDRESS" placeholder="42 Park Street" />
                </div>
                <Field label="CITY" placeholder="Mumbai" />
                <Field label="PINCODE" placeholder="400001" />
                <div className="sm:col-span-2">
                  <Field label="STATE" placeholder="Maharashtra" />
                </div>
              </div>
            </section>

            <section className="relative border border-white/10 bg-white/[0.02] p-8 backdrop-blur">
              <div className="absolute left-0 top-0 h-px w-16 bg-[#ffc72c]" />
              <h2 className="mb-6 text-3xl font-black tracking-tight">Payment method</h2>

              <div className="overflow-hidden border border-white/10 bg-white/[0.025]">
                <PaymentOption active={method === "upi"} onClick={() => setMethod("upi")} label="UPI (QR code)">
                  {["BHIM", "UPI", "PhonePe", "G Pay", "Paytm", "pay", "Play"].map((brand, index) => (
                    <span
                      key={brand}
                      className={`inline-flex h-7 items-center rounded bg-white px-2 text-xs font-black tracking-tight text-black ${
                        index < 2 ? "text-lg italic text-black/60" : ""
                      }`}
                    >
                      {brand}
                    </span>
                  ))}
                </PaymentOption>

                <PaymentOption active={method === "card"} onClick={() => setMethod("card")} label="Credit or debit card" last>
                  {[
                    { label: "VISA", color: "text-[#1a4aa2]" },
                    { label: "MC", color: "text-[#ef3d2f]" },
                    { label: "AMEX", color: "bg-[#2f7dcc] text-white" },
                    { label: "DINERS", color: "text-[#1f5a8a]" },
                  ].map((card) => (
                    <span
                      key={card.label}
                      className={`inline-flex h-7 min-w-12 items-center justify-center rounded bg-white px-2 text-[10px] font-black ${card.color}`}
                    >
                      {card.label}
                    </span>
                  ))}
                </PaymentOption>
              </div>

              {method === "card" && (
                <div className="mt-6 space-y-5">
                  <Field label="CARD NUMBER" placeholder="4242 4242 4242 4242" />
                  <div className="grid grid-cols-3 gap-5">
                    <Field label="EXPIRY" placeholder="MM / YY" />
                    <Field label="CVC" placeholder="123" />
                    <Field label="ZIP" placeholder="10001" />
                  </div>
                  <Field label="NAME ON CARD" placeholder="C. RONALDO" />
                </div>
              )}

              {method === "upi" && (
                <div className="mt-6 grid gap-5 border border-dashed border-white/15 bg-white/[0.02] p-6 sm:grid-cols-[140px_1fr] sm:items-center">
                  <div className="grid aspect-square place-items-center bg-white p-4 text-black">
                    <QrCode className="h-20 w-20" />
                  </div>
                  <div>
                    <div className="font-['Bebas_Neue'] text-3xl tracking-wider">SCAN AND PAY</div>
                    <p className="mt-2 text-sm opacity-55">
                      Use any UPI app to complete payment. Your order will be confirmed after payment verification.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Shield, label: "SSL ENCRYPTED" },
                { icon: Truck, label: "FREE SHIPPING" },
                { icon: Lock, label: "MONEY BACK" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-4">
                  <item.icon className="h-4 w-4 text-[#3dd17f]" />
                  <span className="text-[10px] font-bold tracking-[0.3em] opacity-70">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="self-start lg:sticky lg:top-28">
            <div className="relative overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 backdrop-blur">
              <div
                className="absolute -right-20 -top-20 h-60 w-60 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(232,25,44,0.25), transparent 70%)" }}
              />
              <div className="relative mb-6 flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-[#e8192c]" />
                <h2 className="font-['Bebas_Neue'] text-2xl tracking-[0.2em]">YOUR KIT</h2>
                <span className="ml-auto text-[10px] tracking-[0.3em] opacity-50">{itemCount} ITEMS</span>
              </div>

              <div className="relative mb-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-white/5 pb-4 last:border-0">
                    <div className="relative grid h-24 w-20 shrink-0 place-items-center overflow-hidden border border-white/10 bg-white/[0.03]">
                      <div
                        className="absolute inset-0"
                        style={{ background: `radial-gradient(circle at 50% 60%, rgba(${item.accent},0.35), transparent 70%)` }}
                      />
                      <img
                        src={item.img}
                        alt={item.name}
                        className="relative h-full w-full object-contain p-1 drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]"
                      />
                      <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#e8192c] text-[10px] font-black text-white">
                        {item.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-['Bebas_Neue'] text-lg leading-tight tracking-wider">{item.name}</div>
                      <div className="mb-1 text-[10px] tracking-widest opacity-50">{item.player}</div>
                      <div className="text-[10px] tracking-widest opacity-40">SIZE {item.size}</div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="font-['Bebas_Neue'] text-xl" style={{ color: `rgb(${item.accent})` }}>
                        Rs {item.price * item.qty}
                      </div>
                      <div className="flex items-center border border-white/10 bg-white/[0.03]">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="grid h-8 w-8 place-items-center text-white/60 transition hover:bg-[#e8192c] hover:text-white"
                          title={item.qty === 1 ? `Remove ${item.name}` : `Remove one ${item.name}`}
                        >
                          {item.qty === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                        </button>
                        <span className="grid h-8 min-w-8 place-items-center border-x border-white/10 px-2 text-xs font-black">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => addItem(item.id)}
                          className="grid h-8 w-8 place-items-center text-white/60 transition hover:bg-white hover:text-black"
                          title={`Add one ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="border border-dashed border-white/15 px-5 py-8 text-center">
                    <div className="font-['Bebas_Neue'] text-2xl tracking-wider">YOUR KIT IS EMPTY</div>
                    <Link to="/" className="mt-3 inline-flex text-[10px] font-bold tracking-[0.3em] text-[#e8192c]">
                      BACK TO STORE
                    </Link>
                  </div>
                )}
              </div>

              <div className="relative mb-6 flex gap-2">
                <input
                  placeholder="PROMO CODE"
                  className="flex-1 border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs tracking-[0.2em] outline-none placeholder:opacity-30 focus:border-[#e8192c]"
                />
                <button className="border border-white/10 bg-white/5 px-4 text-[10px] font-bold tracking-[0.25em] transition hover:bg-white hover:text-black">
                  APPLY
                </button>
              </div>

              <div className="relative mb-6 space-y-2.5 text-sm">
                <Row label="Subtotal" value={`Rs ${subtotal}`} />
                <Row label="Shipping" value={shipping === 0 ? "FREE" : `Rs ${shipping}`} highlight={shipping === 0} />
                <Row label="Tax (GST 18%)" value={`Rs ${tax}`} />
                <div className="my-3 h-px bg-white/10" />
                <div className="flex items-end justify-between">
                  <span className="text-[10px] font-bold tracking-[0.3em] opacity-70">TOTAL</span>
                  <span className="font-['Bebas_Neue'] text-4xl text-white" style={{ textShadow: "0 0 30px rgba(232,25,44,0.5)" }}>
                    Rs {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <RazorpayButton
                amount={total}
                cartItems={cart}
                onSuccess={handlePaymentSuccess}
                disabled={cart.length === 0}
                buttonText="PAY"
              />

              <p className="mt-4 text-center text-[10px] tracking-[0.2em] opacity-40">BY PLACING ORDER YOU AGREE TO OUR TERMS</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PaymentOption({
  active,
  children,
  label,
  last,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  last?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-5 text-left transition ${last ? "" : "border-b border-white/10"} ${
        active ? "bg-white/[0.06]" : "hover:bg-white/[0.035]"
      }`}
    >
      <span className="flex items-center gap-4 text-xl">
        <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? "border-[#e8192c]" : "border-white/40"}`}>
          {active && <span className="h-2.5 w-2.5 rounded-full bg-[#e8192c]" />}
        </span>
        <span>{label}</span>
      </span>
      <span className="mt-5 flex flex-wrap items-center gap-3 pl-9">{children}</span>
    </button>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-60">{label}</span>
      <span className={highlight ? "font-bold tracking-wider text-[#3dd17f]" : ""}>{value}</span>
    </div>
  );
}
