import jerseyMilan from "@/assets/jersey-milan.webp";
import jerseyMessi from "@/assets/jersey-messi.webp";
import jerseyMadrid from "@/assets/jersey-madrid.webp";
import jerseyRonaldo from "@/assets/jersey-ronaldo.webp";

export type Product = {
  id: string;
  name: string;
  team: string;
  player: string;
  price: number;
  oldPrice?: number;
  stock: number;
  badge?: string;
  img: string;
  accent: string;
};

export const STORAGE_KEY = "playpoint-admin-products";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "milan",
    name: "AC Milan Home '08",
    team: "AC MILAN",
    player: "KAKA #22",
    price: 550,
    oldPrice: 800,
    stock: 18,
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
    stock: 24,
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
    stock: 9,
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
    stock: 15,
    badge: "ICONIC",
    img: jerseyRonaldo,
    accent: "232,25,44",
  },
];

export const PRODUCT_IMAGES = [
  { label: "Milan", value: jerseyMilan },
  { label: "Messi", value: jerseyMessi },
  { label: "Madrid", value: jerseyMadrid },
  { label: "Ronaldo", value: jerseyRonaldo },
];
