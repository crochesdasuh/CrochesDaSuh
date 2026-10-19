import { cacheLife, cacheTag } from "next/cache";
import { products as staticProducts, type Badge, type CategoryId, type Product } from "@/data/crochets";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

export const PRODUCTS_TAG = "products";

export type ProductRow = {
  id: string;
  name: string;
  short_description: string;
  description: string;
  image_url: string;
  image_alt: string;
  categories: string[];
  price_from: number | string;
  lead_time_days: number | null;
  badges: string[];
  details: string[];
  quantity_label: string;
  quantity_unit: string;
  quantity_options: number[];
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminProduct = Product & { active: boolean; sortOrder: number; updatedAt: string };

export function rowToProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    image: row.image_url,
    imageAlt: row.image_alt || row.name,
    categories: row.categories as Exclude<CategoryId, "todos">[],
    priceFrom: Number(row.price_from),
    leadTime:
      row.lead_time_days == null
        ? { type: "pronta" }
        : { type: "encomenda", days: row.lead_time_days },
    badges: row.badges as Badge[],
    details: row.details,
    quantity: {
      label: row.quantity_label,
      unit: row.quantity_unit,
      options: row.quantity_options.length ? row.quantity_options : [1],
    },
    active: row.active,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

/** Produtos ativos do catálogo público. Fica em cache até o admin salvar algo. */
export async function getCatalogProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("days");

  if (!isSupabaseConfigured) return staticProducts;

  const { data, error } = await createPublicClient()
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order")
    .order("created_at");

  if (error) {
    console.error("Falha ao carregar produtos do Supabase; usando catálogo estático.", error);
    return staticProducts;
  }
  return (data as ProductRow[]).map(rowToProduct);
}
