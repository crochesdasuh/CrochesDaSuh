import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { rowToProduct, type ProductRow } from "@/lib/products";

/**
 * Garante que quem está chamando é administrador. Use no topo de toda
 * página (dentro de <Suspense>) e de toda Server Action do /admin.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured) redirect("/admin/login");

  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/sem-acesso");

  return { supabase, email: (claims.email as string | undefined) ?? "" };
}

export async function getAdminProducts() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getAdminProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : null;
}

export type Metrics = {
  since: string;
  totals: { page_views: number; visitors: number; product_views: number; whatsapp_clicks: number };
  daily: { day: string; page_views: number; product_views: number; whatsapp_clicks: number }[];
  products: { id: string; name: string; views: number; clicks: number }[];
  palettes: { palette: string; total: number }[];
  referrers: { source: string; total: number }[];
  devices: { device: "mobile" | "desktop"; total: number }[];
};

export async function getMetrics(days: number) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("admin_metrics", { days });
  if (error) throw error;
  return data as Metrics;
}
