import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, memo, useCallback } from "react";
import { ShoppingBag, Star, Truck, Shield, ArrowRight, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import jerseyMilan from "@/assets/jersey-milan.webp";
import jerseyMessi from "@/assets/jersey-messi.webp";
import jerseyMadrid from "@/assets/jersey-madrid.webp";
import jerseyRonaldo from "@/assets/jersey-ronaldo.webp";
import { DEFAULT_PRODUCTS, type Product } from "@/lib/products";
import { dbProductToProduct, getProducts } from "@/lib/product-db";
import { addProductToCart, getCartCount } from "@/lib/cart";

export const Route = createFileRoute("/")({
  component: Index,
});

type Jersey = {
  id: string;
  name: string;
  team: string;
  player: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  img: string;
  accent: string; // rgb
};

const JERSEYS: Jersey[] = [
  {
    id: "milan",
    name: "AC Milan Home '08",
    team: "AC MILAN",
    player: "KAKÁ #22",
    price: 550,
    oldPrice: 800,
    badge: "RETRO",
    img: jerseyMilan,
    accent: "232,25,44",
  },
  {
    id: "messi",
    name: "Argentina World Cup",
    team: "ARGENTINA",
    player: "MESSI #10",
    price: 550,
    oldPrice: 800,
    badge: "CHAMPIONS",
    img: jerseyMessi,
    accent: "108,178,232",
  },
  {
    id: "madrid",
    name: "Real Madrid Dragon",
    team: "REAL MADRID",
    player: "SPECIAL EDITION",
    price: 550,
    badge: "LIMITED",
    img: jerseyMadrid,
    accent: "255,199,44",
  },
  {
    id: "ronaldo",
    name: "Man United Away '07",
    team: "MAN UNITED",
    player: "RONALDO #7",
    price: 550,
    oldPrice: 800,
    badge: "ICONIC",
    img: jerseyRonaldo,
    accent: "232,25,44",
  },
];

function TiltJersey({ img, accent }: { img: string; accent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const r = containerRef.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rotX = (py - 0.5) * -25;
    const rotY = (px - 0.5) * 30;
    const mx = px * 100;
    const my = py * 100;

    innerRef.current!.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    glowRef.current!.style.background = `radial-gradient(circle at ${mx}% ${my}%, rgba(${accent},0.45), transparent 60%)`;
    glossRef.current!.style.background = `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,0.35) 0%, transparent 35%)`;
  }

  function onLeave() {
    innerRef.current!.style.transform = "rotateX(0deg) rotateY(0deg)";
    glowRef.current!.style.background = `radial-gradient(circle at 50% 50%, rgba(${accent},0.45), transparent 60%)`;
    glossRef.current!.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35) 0%, transparent 35%)`;
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative w-full h-full"
      style={{ perspective: "1400px" }}
    >
      <div
        ref={innerRef}
        className="relative w-full h-full transition-transform duration-300 ease-out"
        style={{
          transform: "rotateX(0deg) rotateY(0deg)",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Floor shadow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%] blur-2xl opacity-60"
          style={{
            bottom: "-4%",
            width: "70%",
            height: "10%",
            background: `radial-gradient(ellipse, rgba(${accent},0.55), transparent 70%)`,
            transform: "translateZ(-50px)",
          }}
        />
        {/* Glow halo */}
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(${accent},0.45), transparent 60%)`,
          }}
        />
        {/* Jersey image */}
        <img
          src={img}
          alt="jersey"
          className="relative w-full h-full object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
          style={{ transform: "translateZ(60px)" }}
        />
        {/* Specular gloss */}
        <div
          ref={glossRef}
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-70"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35) 0%, transparent 35%)`,
            transform: "translateZ(80px)",
          }}
        />
      </div>
    </div>
  );
}

const ProductCard = memo(function ProductCard({ j, onAdd }: { j: Product; onAdd: (product: Product) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const r = cardRef.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rotX = (py - 0.5) * -15;
    const rotY = (px - 0.5) * 18;

    cardRef.current!.style.setProperty("--mx", `${px * 100}%`);
    cardRef.current!.style.setProperty("--my", `${py * 100}%`);
    innerRef.current!.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  function onLeave() {
    cardRef.current!.style.setProperty("--mx", "50%");
    cardRef.current!.style.setProperty("--my", "50%");
    innerRef.current!.style.transform = "rotateX(0deg) rotateY(0deg)";
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative bg-gradient-to-b from-[#13131a] to-[#0a0a10] border border-white/5 overflow-hidden"
      style={{ perspective: "1200px", "--mx": "50%", "--my": "50%" } as React.CSSProperties}
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at var(--mx) var(--my), rgba(${j.accent},0.18), transparent 60%)`,
        }}
      />
      {j.badge && (
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-white"
          style={{
            background: `rgb(${j.accent})`,
            clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
          }}
        >
          {j.badge}
        </div>
      )}

      {/* 3D image */}
      <div className="aspect-square p-8 relative">
        <div
          ref={innerRef}
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: "rotateX(0deg) rotateY(0deg)",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-2 w-3/4 h-6 rounded-[50%] blur-xl opacity-70"
            style={{ background: `radial-gradient(ellipse, rgba(${j.accent},0.5), transparent 70%)` }}
          />
          <img
            src={j.img}
            alt={j.name}
            className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            style={{ transform: "translateZ(40px)", filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.55))" }}
          />
          <div
            className="absolute inset-0 mix-blend-overlay opacity-0 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.4), transparent 40%)`,
              transform: "translateZ(60px)",
            }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-6 border-t border-white/5 relative">
        <div className="text-[10px] tracking-[0.3em] font-bold opacity-50 mb-2">{j.team}</div>
        <h3 className="font-['Bebas_Neue'] text-2xl tracking-wider mb-1">{j.name}</h3>
        <div className="text-xs opacity-60 mb-4">{j.player}</div>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-['Bebas_Neue'] text-3xl" style={{ color: `rgb(${j.accent})` }}>
              ₹{j.price}
            </span>
            {j.oldPrice && (
              <span className="text-sm opacity-40 line-through">₹{j.oldPrice}</span>
            )}
          </div>
          <button
            onClick={() => onAdd(j)}
            className="px-4 py-2 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 text-[10px] tracking-[0.25em] font-bold transition-all flex items-center gap-2"
          >
            ADD <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
});

function Index() {
  const [cartCount, setCartCount] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const hero = products[heroIdx] ?? DEFAULT_PRODUCTS[0];

  const handleAdd = useCallback((product: Product) => {
    const nextCart = addProductToCart(product);
    setCartCount(nextCart.reduce((sum, item) => sum + item.qty, 0));
  }, []);

  useEffect(() => {
    setCartCount(getCartCount());
  }, []);

  useEffect(() => {
    async function loadStoreProducts() {
      try {
        const dbProducts = await getProducts();
        setProducts(dbProducts.length > 0 ? dbProducts.map(dbProductToProduct) : DEFAULT_PRODUCTS);
      } catch (error) {
        console.error(error);
        setProducts(DEFAULT_PRODUCTS);
      }
    }

    loadStoreProducts();
  }, []);

  useEffect(() => {
    if (heroIdx >= products.length) {
      setHeroIdx(0);
    }
  }, [heroIdx, products.length]);

  useEffect(() => {
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % Math.max(products.length, 1)), 5000);
    return () => clearInterval(id);
  }, [products.length]);

  return (
    <div className="min-h-screen bg-[#050508] text-[#f5f5f0] overflow-x-hidden" style={{ fontFamily: "Barlow, system-ui, sans-serif" }}>

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 md:px-12 py-5 backdrop-blur-xl bg-black/60 border-b border-white/5 flex items-center justify-between">
        <div className="font-['Bebas_Neue'] text-2xl md:text-3xl tracking-[0.3em]">
          PLAY<span className="text-[#e8192c]">POINT</span>
        </div>
        <ul className="hidden md:flex gap-10 text-[11px] tracking-[0.3em] font-semibold opacity-70">
          <li className="hover:text-[#e8192c] cursor-pointer transition">SHOP</li>
          <li className="hover:text-[#e8192c] cursor-pointer transition">CLUBS</li>
          <li className="hover:text-[#e8192c] cursor-pointer transition">RETRO</li>
          <li className="hover:text-[#e8192c] cursor-pointer transition">CUSTOM</li>
        </ul>
        <Link to="/checkout" className="relative bg-[#e8192c] hover:bg-[#ff2d40] transition px-5 py-2.5 text-[11px] font-bold tracking-[0.25em] flex items-center gap-2"
          style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}>
          <ShoppingBag className="w-4 h-4" />
          CART
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#ffc72c] text-black text-[10px] w-5 h-5 rounded-full grid place-items-center font-black">
              {cartCount}
            </span>
          )}
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 pt-32 pb-20 overflow-hidden">
        {/* Animated bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 80% 60% at 75% 50%, rgba(${hero.accent},0.18), transparent 70%), linear-gradient(180deg, #050508, #0a0a14)`,
            transition: "background 1s",
          }} />
          {/* 3D grid floor */}
          <div className="absolute bottom-0 inset-x-0 h-1/2"
            style={{
              background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0, transparent 1px, transparent 70px), repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0, transparent 1px, transparent 70px)",
              transform: "perspective(700px) rotateX(62deg)",
              transformOrigin: "bottom",
              maskImage: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
            }} />
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-3 text-[11px] tracking-[0.4em] font-bold text-[#e8192c] mb-6">
              <span className="w-8 h-px bg-[#e8192c]" />
              PREMIUM JERSEY STORE
            </div>
            <h1 className="font-['Bebas_Neue'] text-[clamp(64px,9vw,140px)] leading-[0.85] tracking-wider mb-6">
              WEAR THE
              <br />
              <span style={{ color: `rgb(${hero.accent})`, textShadow: `0 0 60px rgba(${hero.accent},0.5)`, transition: "color 1s, text-shadow 1s" }}>
                LEGEND
              </span>
            </h1>
            <p className="text-base opacity-60 leading-relaxed max-w-md mb-10 font-light">
              Authentic jerseys from the world's greatest clubs and players. Stitched, signed, shipped — straight from the pitch to your wardrobe.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button className="bg-[#e8192c] hover:bg-[#ff2d40] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(232,25,44,0.4)] transition-all px-10 py-5 font-['Bebas_Neue'] text-xl tracking-[0.25em]"
                style={{ clipPath: "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)" }}>
                SHOP NOW
              </button>
              <button className="border border-white/20 hover:border-[#e8192c] hover:text-[#e8192c] px-10 py-5 font-['Bebas_Neue'] text-xl tracking-[0.25em] transition"
                style={{ clipPath: "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)" }}>
                EXPLORE
              </button>
            </div>

            {/* dots */}
            <div className="flex gap-2 mt-12">
              {products.map((j, i) => (
                <button key={j.id} onClick={() => setHeroIdx(i)}
                  className="h-1 transition-all"
                  style={{
                    width: i === heroIdx ? 40 : 16,
                    background: i === heroIdx ? `rgb(${j.accent})` : "rgba(255,255,255,0.2)",
                  }} />
              ))}
            </div>
          </div>

          {/* 3D Jersey */}
          <div className="relative h-[420px] md:h-[560px]">
            <TiltJersey img={hero.img} accent={hero.accent} />
            {/* Side text */}
            <div className="absolute right-0 top-4 text-right">
              <div className="font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wider" style={{ color: `rgb(${hero.accent})` }}>
                {hero.team}
              </div>
              <div className="text-[11px] tracking-[0.3em] opacity-60 mt-1">{hero.player}</div>
              <div className="font-['Bebas_Neue'] text-6xl mt-4">₹{hero.price}</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-white/5 bg-[#0a0a10] grid grid-cols-2 md:grid-cols-4 px-6 md:px-12 py-8">
        {[
          { n: "120+", l: "CLUB JERSEYS" },
          { n: "50K", l: "HAPPY FANS" },
          { n: "24H", l: "FAST DISPATCH" },
          { n: "100%", l: "AUTHENTIC" },
        ].map((s, i) => (
          <div key={i} className="text-center px-6 md:border-r border-white/5 last:border-r-0">
            <div className="font-['Bebas_Neue'] text-5xl text-[#e8192c]" style={{ textShadow: "0 0 25px rgba(232,25,44,0.3)" }}>
              {s.n}
            </div>
            <div className="text-[10px] tracking-[0.3em] opacity-50 mt-1">{s.l}</div>
          </div>
        ))}
      </section>

      {/* PRODUCTS */}
      <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
          <div>
            <div className="flex items-center gap-3 text-[11px] tracking-[0.4em] font-bold text-[#e8192c] mb-3">
              <span className="w-6 h-px bg-[#e8192c]" /> FEATURED DROPS
            </div>
            <h2 className="font-['Bebas_Neue'] text-5xl md:text-7xl tracking-wider">
              THE COLLECTION
            </h2>
          </div>
          <button className="flex items-center gap-2 text-xs tracking-[0.3em] font-bold opacity-70 hover:opacity-100 hover:text-[#e8192c] transition">
            VIEW ALL <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((j) => (
            <ProductCard key={j.id} j={j} onAdd={handleAdd} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 md:px-12 py-20 bg-[#0a0a10] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { i: Truck, t: "FREE ALL-INDIA SHIPPING", d: "On orders above ₹500. Tracked & insured." },
            { i: Shield, t: "AUTHENTICITY GUARANTEED", d: "Every jersey verified, hologram sealed." },
            { i: Star, t: "CUSTOM PRINTING", d: "Add your name & number. Pro-grade thermal press." },
          ].map((f, i) => (
            <div key={i} className="p-8 border border-white/5 hover:border-[#e8192c]/40 transition group">
              <f.i className="w-8 h-8 text-[#e8192c] mb-5 group-hover:scale-110 transition" />
              <h3 className="font-['Bebas_Neue'] text-2xl tracking-wider mb-2">{f.t}</h3>
              <p className="text-sm opacity-60">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(232,25,44,0.15), transparent 60%)" }} />
        <div className="relative">
          <div className="text-[11px] tracking-[0.4em] font-bold text-[#e8192c] mb-4">JOIN THE SQUAD</div>
          <h2 className="font-['Bebas_Neue'] text-5xl md:text-8xl tracking-wider leading-none mb-6">
            BUILT FOR
            <br />
            <span className="text-[#e8192c]" style={{ textShadow: "0 0 40px rgba(232,25,44,0.5)" }}>TRUE FANS</span>
          </h2>
          <p className="opacity-60 max-w-md mx-auto mb-10">Get 10% off your first order and early access to limited drops.</p>
          <div className="flex max-w-md mx-auto">
            <input type="email" placeholder="your@email.com"
              className="flex-1 bg-white/5 border border-white/10 px-5 py-4 outline-none focus:border-[#e8192c] text-sm tracking-wider" />
            <button className="bg-[#e8192c] hover:bg-[#ff2d40] transition px-8 font-['Bebas_Neue'] text-lg tracking-[0.2em]">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 py-10 border-t border-white/5 flex flex-wrap justify-between gap-4 text-xs opacity-50 tracking-wider">
        <div>© 2026 PLAYPOINT — All jerseys authentic.</div>
        <div className="flex gap-6">
          <span className="hover:text-[#e8192c] cursor-pointer">PRIVACY</span>
          <span className="hover:text-[#e8192c] cursor-pointer">TERMS</span>
          <span className="hover:text-[#e8192c] cursor-pointer">CONTACT</span>
        </div>
      </footer>
    </div>
  );
}
