import { supabase } from "./supabase";
import type { Product } from "./products";

export type DbProduct = {
  id: string;
  name: string;
  team: string;
  player: string;
  price: number;
  old_price: number | null;
  stock: number;
  badge: string | null;
  image_url: string;
  accent: string;
  created_at: string;
};

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as DbProduct[];
}

export async function addProduct(product: {
  name: string;
  team: string;
  player: string;
  price: number;
  old_price?: number | null;
  stock: number;
  badge?: string | null;
  image_url: string;
  accent: string;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data as DbProduct;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File) {
  const extension = file.name.split(".").pop() || "webp";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export function dbProductToProduct(product: DbProduct): Product {
  return {
    id: product.id,
    name: product.name,
    team: product.team,
    player: product.player,
    price: product.price,
    oldPrice: product.old_price ?? undefined,
    stock: product.stock,
    badge: product.badge ?? undefined,
    img: product.image_url,
    accent: product.accent,
  };
}
