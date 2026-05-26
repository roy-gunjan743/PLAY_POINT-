import { supabase } from "./supabase";
import type { CartItem } from "./cart";

export type DbOrder = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
};

export async function saveOrder(order: Omit<DbOrder, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (error) throw error;
  return data as DbOrder;
}

export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as DbOrder[];
}

export async function updateOrderStatus(id: string, status: "pending" | "confirmed" | "rejected") {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);

  if (error) throw error;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) throw error;
}
