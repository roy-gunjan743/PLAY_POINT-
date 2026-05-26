import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeIndianRupee,
  Upload,
  PackagePlus,
  Plus,
  Search,
  Shirt,
  Trash2,
  Check,
  X,
  Package,
} from "lucide-react";
import { DEFAULT_PRODUCTS, PRODUCT_IMAGES, type Product } from "@/lib/products";
import { addProduct as createProduct, dbProductToProduct, deleteProduct, getProducts, uploadProductImage } from "@/lib/product-db";
import { getOrders, updateOrderStatus, type DbOrder } from "@/lib/order-db";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin - PLAYPOINT" },
      { name: "description", content: "Add and remove PLAYPOINT products." },
    ],
  }),
  component: Admin,
});

const ACCENTS = [
  { name: "Red", value: "232,25,44", className: "bg-[#e8192c]" },
  { name: "Blue", value: "108,178,232", className: "bg-[#6cb2e8]" },
  { name: "Gold", value: "255,199,44", className: "bg-[#ffc72c]" },
  { name: "Green", value: "61,209,127", className: "bg-[#3dd17f]" },
];

const EMPTY_FORM = {
  name: "",
  team: "",
  player: "",
  price: "550",
  stock: "10",
  badge: "",
  img: PRODUCT_IMAGES[0].value,
  accent: "232,25,44",
};

function Field({
  label,
  icon,
  ...props
}: { label: string; icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold tracking-[0.3em] opacity-50">{label}</span>
      <span className="relative block">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">{icon}</span>}
        <input
          {...props}
          className={`w-full border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm tracking-wide outline-none transition placeholder:opacity-30 focus:border-[#e8192c] focus:bg-white/[0.05] ${
            icon ? "pl-11" : ""
          }`}
        />
      </span>
    </label>
  );
}

function StorefrontPreview({ form }: { form: typeof EMPTY_FORM }) {
  const name = form.name.trim() || "New Jersey Drop";
  const team = form.team.trim() || "TEAM NAME";
  const player = form.player.trim() || "PLAYER #10";
  const badge = form.badge.trim() || "NEW";
  const price = Number(form.price) || 0;

  return (
    <div>
      <div className="mb-2 text-[10px] font-bold tracking-[0.3em] opacity-50">STORE PREVIEW</div>
      <div
        className="group relative overflow-hidden border border-white/5 bg-gradient-to-b from-[#13131a] to-[#0a0a10]"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-0 opacity-100 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(${form.accent},0.16), transparent 60%)`,
          }}
        />
        {badge && (
          <div
            className="absolute left-4 top-4 z-10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-white"
            style={{
              background: `rgb(${form.accent})`,
              clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
            }}
          >
            {badge.toUpperCase()}
          </div>
        )}

        <div className="relative aspect-square p-8">
          <div
            className="absolute bottom-7 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-[50%] blur-xl opacity-70"
            style={{ background: `radial-gradient(ellipse, rgba(${form.accent},0.5), transparent 70%)` }}
          />
          <img
            src={form.img}
            alt={name}
            className="relative h-full w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]"
          />
        </div>

        <div className="relative border-t border-white/5 p-6">
          <div className="mb-2 text-[10px] font-bold tracking-[0.3em] opacity-50">{team.toUpperCase()}</div>
          <h3 className="mb-1 font-['Bebas_Neue'] text-2xl tracking-wider">{name}</h3>
          <div className="mb-4 text-xs opacity-60">{player.toUpperCase()}</div>
          <div className="flex items-end justify-between gap-4">
            <span className="font-['Bebas_Neue'] text-3xl" style={{ color: `rgb(${form.accent})` }}>
              Rs {price}
            </span>
            <button
              type="button"
              className="flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold tracking-[0.25em] text-white"
            >
              ADD <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    refreshProducts();
    refreshOrders();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.team, product.player, product.badge].some((value) =>
        (value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [products, query]);

  const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= 10).length;

  async function refreshProducts() {
    try {
      const dbProducts = await getProducts();
      setProducts(dbProducts.map(dbProductToProduct));
      setStatus("");
    } catch (error) {
      console.error(error);
      setStatus("Could not load Supabase products. Showing demo products.");
      setProducts(DEFAULT_PRODUCTS);
    }
  }

  async function refreshOrders() {
    try {
      const dbOrders = await getOrders();
      setOrders(dbOrders);
      setStatus("");
    } catch (error) {
      console.error(error);
      setStatus(`Error loading orders: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async function confirmPayment(orderId: string) {
    try {
      await updateOrderStatus(orderId, "confirmed");
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: "confirmed" } : order)));
      setStatus("Payment confirmed!");
    } catch (error) {
      console.error(error);
      setStatus("Could not confirm payment.");
    }
  }

  async function rejectPayment(orderId: string) {
    try {
      await updateOrderStatus(orderId, "rejected");
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: "rejected" } : order)));
      setStatus("Payment rejected.");
    } catch (error) {
      console.error(error);
      setStatus("Could not reject payment.");
    }
  }

  async function addProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const team = form.team.trim().toUpperCase();
    const player = form.player.trim().toUpperCase();
    if (!name || !team || !player || !form.img) return;

    setIsSaving(true);
    setStatus("");

    try {
      const dbProduct = await createProduct({
        name,
        team,
        player,
        price: Number(form.price),
        old_price: null,
        stock: Number(form.stock),
        badge: form.badge.trim().toUpperCase() || null,
        image_url: form.img,
        accent: form.accent,
      });

      setProducts((currentProducts) => [dbProductToProduct(dbProduct), ...currentProducts]);
      setForm(EMPTY_FORM);
      setFileName("");
      setStatus("Product saved to Supabase.");
    } catch (error) {
      console.error(error);
      setStatus("Could not save product. Check Supabase product insert policy.");
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setStatus("");

    try {
      const imageUrl = await uploadProductImage(file);
      setForm((currentForm) => ({ ...currentForm, img: imageUrl }));
      setStatus("Image uploaded to Supabase Storage.");
    } catch (error) {
      console.error(error);
      setStatus("Could not upload image. Check Storage bucket policies.");
    } finally {
      setIsUploading(false);
    }
  }

  async function removeProduct(id: string) {
    try {
      await deleteProduct(id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
      setStatus("Product deleted from Supabase.");
    } catch (error) {
      console.error(error);
      setStatus("Could not delete product. Check Supabase product delete policy.");
    }
  }

  function resetProducts() {
    setProducts(DEFAULT_PRODUCTS);
    setStatus("Showing demo products locally. Supabase data was not changed.");
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
          <Shirt className="h-4 w-4 text-[#e8192c]" />
          PRODUCT ADMIN
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.3em] opacity-70 transition hover:opacity-100"
        >
          <ArrowLeft className="h-4 w-4" />
          STORE
        </Link>
      </nav>

      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 12% 12%, rgba(232,25,44,0.16), transparent 62%), radial-gradient(ellipse 55% 40% at 88% 78%, rgba(255,199,44,0.1), transparent 60%), linear-gradient(180deg, #050508, #0a0a14)",
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-1/2"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0, transparent 1px, transparent 70px), repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0, transparent 1px, transparent 70px)",
            transform: "perspective(700px) rotateX(62deg)",
            transformOrigin: "bottom",
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.48), transparent)",
          }}
        />
      </div>

      <main className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 md:px-12">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[11px] font-bold tracking-[0.4em] text-[#e8192c]">
              <span className="h-px w-8 bg-[#e8192c]" />
              BACK OFFICE
            </div>
            <h1 className="font-['Bebas_Neue'] text-[clamp(56px,8vw,108px)] leading-[0.85] tracking-wider">
              {tab === "products" ? "MANAGE PRODUCTS" : "CUSTOMER BOOKINGS"}
            </h1>
          </div>
          <button
            onClick={resetProducts}
            className="border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-bold tracking-[0.28em] opacity-70 transition hover:border-[#e8192c] hover:text-[#e8192c] hover:opacity-100"
          >
            REFRESH
          </button>
        </header>

        <div className="mb-8 flex gap-4 border-b border-white/10">
          {[
            { id: "products", label: "PRODUCTS", icon: Shirt },
            { id: "orders", label: "ORDERS", icon: Package },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as typeof tab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-[11px] font-bold tracking-[0.3em] transition ${
                tab === item.id ? "border-[#e8192c] text-[#e8192c]" : "border-transparent opacity-50 hover:opacity-70"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "PRODUCTS", value: products.length },
                { label: "LOW STOCK", value: lowStock },
                { label: "INVENTORY", value: `Rs ${inventoryValue}` },
              ].map((stat, index) => (
                <div key={stat.label} className="border border-white/10 bg-white/[0.025] p-5">
                  <div className="text-[10px] font-bold tracking-[0.3em] opacity-45">{stat.label}</div>
                  <div
                    className="mt-2 font-['Bebas_Neue'] text-5xl tracking-wider"
                    style={{ color: index === 1 && lowStock > 0 ? "#ffc72c" : "#f5f5f0" }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </section>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
          <form onSubmit={addProduct} className="self-start border border-white/10 bg-white/[0.025] p-6 backdrop-blur">
            <div className="mb-6 flex items-center gap-3">
              <PackagePlus className="h-5 w-5 text-[#e8192c]" />
              <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider">ADD PRODUCT</h2>
            </div>
            {status && (
              <div className="mb-5 border border-white/10 bg-white/[0.035] px-4 py-3 text-xs tracking-wide text-white/70">
                {status}
              </div>
            )}

            <div className="grid gap-5">
              <Field
                label="PRODUCT NAME"
                placeholder="Brazil Home '02"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                icon={<Shirt className="h-4 w-4" />}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="TEAM"
                  placeholder="Brazil"
                  value={form.team}
                  onChange={(event) => setForm({ ...form, team: event.target.value })}
                />
                <Field
                  label="PLAYER"
                  placeholder="Ronaldo #9"
                  value={form.player}
                  onChange={(event) => setForm({ ...form, player: event.target.value })}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field
                  label="PRICE"
                  min="1"
                  type="number"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  icon={<BadgeIndianRupee className="h-4 w-4" />}
                />
                <Field
                  label="STOCK"
                  min="0"
                  type="number"
                  value={form.stock}
                  onChange={(event) => setForm({ ...form, stock: event.target.value })}
                />
                <Field
                  label="BADGE"
                  placeholder="NEW"
                  value={form.badge}
                  onChange={(event) => setForm({ ...form, badge: event.target.value })}
                />
              </div>

              <div>
                <div className="mb-2 text-[10px] font-bold tracking-[0.3em] opacity-50">IMAGE</div>
                <label className="grid cursor-pointer gap-4 border border-dashed border-white/15 bg-white/[0.025] p-5 transition hover:border-[#e8192c] hover:bg-[#e8192c]/10 sm:grid-cols-[96px_1fr] sm:items-center">
                  <input type="file" accept="image/*" onChange={uploadImage} className="sr-only" />
                  <span className="grid h-24 place-items-center border border-white/10 bg-black/20">
                    <img src={form.img} alt="Selected jersey" className="h-full w-full object-contain p-2" />
                  </span>
                  <span>
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.3em]">
                      <Upload className="h-4 w-4 text-[#e8192c]" />
                      UPLOAD JERSEY IMAGE
                    </span>
                    <span className="block text-xs opacity-50">
                      {isUploading ? "Uploading to Supabase..." : fileName || "PNG, JPG, or WEBP. Product image updates below."}
                    </span>
                  </span>
                </label>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-bold tracking-[0.3em] opacity-50">ACCENT</div>
                <div className="flex flex-wrap gap-3">
                  {ACCENTS.map((accent) => (
                    <button
                      key={accent.value}
                      type="button"
                      title={accent.name}
                      onClick={() => setForm({ ...form, accent: accent.value })}
                      className={`h-10 w-10 border transition ${accent.className} ${
                        form.accent === accent.value ? "border-white scale-105" : "border-white/10 opacity-70"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <StorefrontPreview form={form} />

              <button
                disabled={isSaving || isUploading}
                className="mt-2 flex items-center justify-center gap-3 bg-[#e8192c] py-4 font-['Bebas_Neue'] text-xl tracking-[0.28em] transition hover:-translate-y-0.5 hover:bg-[#ff2d40] hover:shadow-[0_20px_40px_rgba(232,25,44,0.35)]"
                style={{ clipPath: "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)" }}
              >
                <Plus className="h-4 w-4" />
                {isSaving ? "SAVING" : "ADD PRODUCT"}
              </button>
            </div>
          </form>

          <section className="border border-white/10 bg-white/[0.025] p-6 backdrop-blur">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider">PRODUCT LIST</h2>
              <label className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="SEARCH"
                  className="w-full border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-xs tracking-[0.25em] outline-none transition placeholder:opacity-35 focus:border-[#e8192c]"
                />
              </label>
            </div>

            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="grid gap-4 border border-white/10 bg-black/20 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                  <div className="relative h-28 overflow-hidden border border-white/10 bg-white/[0.03]">
                    <div
                      className="absolute inset-0"
                      style={{ background: `radial-gradient(circle at 50% 65%, rgba(${product.accent},0.35), transparent 70%)` }}
                    />
                    <img src={product.img} alt={product.name} className="relative h-full w-full object-contain p-2" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {product.badge && (
                        <span
                          className="px-2.5 py-1 text-[9px] font-black tracking-[0.25em]"
                          style={{ background: `rgb(${product.accent})` }}
                        >
                          {product.badge}
                        </span>
                      )}
                      <span className="text-[10px] font-bold tracking-[0.3em] opacity-45">{product.team}</span>
                    </div>
                    <h3 className="font-['Bebas_Neue'] text-3xl leading-none tracking-wider">{product.name}</h3>
                    <div className="mt-1 text-[11px] tracking-[0.24em] opacity-55">{product.player}</div>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs">
                      <span className="font-bold" style={{ color: `rgb(${product.accent})` }}>
                        Rs {product.price}
                      </span>
                      <span className={product.stock <= 10 ? "text-[#ffc72c]" : "opacity-55"}>{product.stock} IN STOCK</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.03] text-white/60 transition hover:border-[#e8192c] hover:bg-[#e8192c] hover:text-white"
                    title={`Remove ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
          </>
        )}

        {tab === "orders" && (
          <section className="border border-white/10 bg-white/[0.025] p-6 backdrop-blur">
            {status && (
              <div className="mb-5 border border-white/10 bg-white/[0.035] px-4 py-3 text-xs tracking-wide text-white/70">
                {status}
              </div>
            )}
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 opacity-50">No orders yet</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-white/10 bg-black/20 p-6">
                    <div className="grid gap-6 md:grid-cols-[1fr_1fr_auto]">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.3em] opacity-50 mb-3">CUSTOMER</div>
                        <div className="space-y-1">
                          <div className="font-['Bebas_Neue'] text-lg tracking-wider">{order.first_name} {order.last_name}</div>
                          <div className="text-sm opacity-70">{order.email}</div>
                          <div className="text-sm opacity-70">{order.phone}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.3em] opacity-50 mb-3">SHIPPING ADDRESS</div>
                        <div className="space-y-1 text-sm">
                          <div>{order.address}</div>
                          <div>{order.city}, {order.state} {order.pincode}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold tracking-[0.3em] opacity-50 mb-3">ORDER TOTAL</div>
                        <div className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#e8192c]">Rs {order.total}</div>
                        <div className="mt-2 text-xs opacity-60">
                          Subtotal: Rs {order.subtotal} | Tax: Rs {order.tax}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-6">
                      <div className="text-[10px] font-bold tracking-[0.3em] opacity-50 mb-3">ITEMS ({order.items.length})</div>
                      <div className="space-y-2 text-sm">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.name} × {item.qty}</span>
                            <span>Rs {item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.3em] opacity-50 mb-2">STATUS</div>
                        <div
                          className={`inline-block px-3 py-1 text-xs font-bold tracking-[0.2em] ${
                            order.status === "confirmed"
                              ? "bg-[#3dd17f] text-black"
                              : order.status === "rejected"
                                ? "bg-[#e8192c] text-white"
                                : "bg-[#ffc72c] text-black"
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </div>
                      </div>
                      {order.status === "pending" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => confirmPayment(order.id)}
                            className="flex items-center gap-2 bg-[#3dd17f] text-black px-4 py-2 text-sm font-bold tracking-[0.2em] transition hover:bg-[#2eb06f]"
                          >
                            <Check className="h-4 w-4" /> CONFIRM
                          </button>
                          <button
                            onClick={() => rejectPayment(order.id)}
                            className="flex items-center gap-2 bg-[#e8192c] text-white px-4 py-2 text-sm font-bold tracking-[0.2em] transition hover:bg-[#ff2d40]"
                          >
                            <X className="h-4 w-4" /> REJECT
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
