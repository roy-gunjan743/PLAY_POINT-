import type { Product } from "./products";

export type CartItem = {
  id: string;
  name: string;
  player: string;
  size: string;
  price: number;
  qty: number;
  img: string;
  accent: string;
};

const CART_KEY = "playpoint-cart";

export function loadCart() {
  if (typeof window === "undefined") return [];

  try {
    const savedCart = window.localStorage.getItem(CART_KEY);
    return savedCart ? (JSON.parse(savedCart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function getCartCount() {
  return loadCart().reduce((sum, item) => sum + item.qty, 0);
}

export function addProductToCart(product: Product) {
  const cart = loadCart();
  const existingItem = cart.find((item) => item.id === product.id);

  const nextCart = existingItem
    ? cart.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
    : [
        ...cart,
        {
          id: product.id,
          name: product.name,
          player: product.player,
          size: "L",
          price: product.price,
          qty: 1,
          img: product.img,
          accent: product.accent,
        },
      ];

  saveCart(nextCart);
  return nextCart;
}
