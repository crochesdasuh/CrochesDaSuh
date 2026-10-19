import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PricingInput } from "@/lib/pricing";
import {
  youtubeId,
  youtubeThumbnail,
  type RecipeRow,
  type RecipeView,
} from "@/lib/recipes";
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

// ---------------------------------------------------------------- calculadora

export type SavedCalculation = {
  id: string;
  name: string;
  product_id: string | null;
  input: PricingInput;
  material_cost: number;
  labor_cost: number;
  total_hours: number;
  price: number;
  notes: string;
  updated_at: string;
};

export async function getCalculations() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("price_calculations")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as SavedCalculation[]).map((c) => ({
    ...c,
    material_cost: Number(c.material_cost),
    labor_cost: Number(c.labor_cost),
    total_hours: Number(c.total_hours),
    price: Number(c.price),
  }));
}

export async function getCalculation(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("price_calculations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as SavedCalculation | null;
}

// ---------------------------------------------------------------- receitas


/**
 * Os arquivos das receitas são privados: a página recebe só o endereço interno
 * /admin/arquivo/<arquivo>, que confere o login a cada acesso.
 */
function toView(r: RecipeRow): RecipeView {
  const fileUrl = (path: string) => `/admin/arquivo/${path}`;
  const photoUrl = r.photo_path ? fileUrl(r.photo_path) : null;
  const video = r.links.map((l) => youtubeId(l.url)).find(Boolean);
  return {
    ...r,
    photoUrl,
    thumbnailUrl: photoUrl ?? (video ? youtubeThumbnail(video) : null),
    files: r.files.map((f) => ({ ...f, url: fileUrl(f.path) })),
  };
}

export async function getRecipes() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as RecipeRow[]).map(toView);
}

export async function getRecipe(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return toView(data as RecipeRow);
}
