"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { categories } from "@/data/crochets";
import { requireAdmin } from "@/lib/admin";
import { PRODUCTS_TAG } from "@/lib/products";
import { PRODUCT_IMAGES_BUCKET, isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | undefined;

// ---------------------------------------------------------------- login

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: "O Supabase ainda não foi configurado." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha incorretos." };

  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// ---------------------------------------------------------------- produtos

const CATEGORY_IDS = new Set<string>(categories.map((c) => c.id).filter((id) => id !== "todos"));
const BADGES = new Set(["Mais Pedido", "Pronta Entrega", "Novidade", "Feito sob Medida"]);

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Caminho do arquivo no bucket, se a URL for de uma foto enviada pelo admin. */
function storagePath(imageUrl: string | null | undefined) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const i = imageUrl?.indexOf(marker) ?? -1;
  return imageUrl && i >= 0 ? decodeURIComponent(imageUrl.slice(i + marker.length)) : null;
}

function parseProduct(formData: FormData) {
  const get = (key: string) => String(formData.get(key) ?? "").trim();

  const name = get("name");
  if (name.length < 2) return { error: "Dê um nome para o produto." } as const;

  const imageUrl = get("image_url");
  if (!imageUrl) return { error: "Envie uma foto do produto." } as const;

  const rawPrice = get("price_from");
  // Aceita "189.90" (input numérico) e "1.189,90" (digitado no padrão brasileiro).
  const price = Number(
    rawPrice.includes(",") ? rawPrice.replace(/\./g, "").replace(",", ".") : rawPrice,
  );
  if (!Number.isFinite(price) || price <= 0) return { error: "Informe o preço (a partir de)." } as const;

  const ready = formData.get("pronta_entrega") === "on";
  const days = Number(get("lead_time_days"));
  if (!ready && !(Number.isInteger(days) && days >= 1 && days <= 120)) {
    return { error: "Informe o prazo de confecção em dias (1 a 120)." } as const;
  }

  const quantityOptions = [...new Set(get("quantity_options").split(/[,;\s]+/).map(Number))]
    .filter((n) => Number.isInteger(n) && n > 0 && n < 1000)
    .sort((a, b) => a - b)
    .slice(0, 8);
  if (!quantityOptions.length) return { error: "Informe as opções de quantidade (ex.: 1, 2, 3)." } as const;

  // "Pronta entrega" é derivada do prazo, não escolhida à mão.
  const cats = formData
    .getAll("categories")
    .map(String)
    .filter((c) => CATEGORY_IDS.has(c) && c !== "pronta-entrega");
  if (ready) cats.push("pronta-entrega");

  return {
    data: {
      name,
      short_description: get("short_description"),
      description: get("description"),
      image_url: imageUrl,
      image_alt: get("image_alt") || name,
      categories: cats,
      price_from: Math.round(price * 100) / 100,
      lead_time_days: ready ? null : days,
      badges: formData.getAll("badges").map(String).filter((b) => BADGES.has(b)),
      details: get("details")
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean)
        .slice(0, 12),
      quantity_label: get("quantity_label") || "Quantidade",
      quantity_unit: get("quantity_unit") || "unidade(s)",
      quantity_options: quantityOptions,
      active: formData.get("active") === "on",
      sort_order: Number.parseInt(get("sort_order"), 10) || 0,
    },
  } as const;
}

export async function saveProduct(_: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = parseProduct(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existingId = String(formData.get("id") ?? "");

  if (existingId) {
    const { data: before } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", existingId)
      .maybeSingle();

    const { error } = await supabase.from("products").update(parsed.data).eq("id", existingId);
    if (error) return { error: "Não foi possível salvar. Tente novamente." };

    const oldPath = storagePath(before?.image_url);
    if (oldPath && before?.image_url !== parsed.data.image_url) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([oldPath]);
    }
  } else {
    const base = slugify(parsed.data.name) || "produto";
    let id = base;
    for (let n = 2; ; n++) {
      const { data } = await supabase.from("products").select("id").eq("id", id).maybeSingle();
      if (!data) break;
      id = `${base}-${n}`;
    }
    const { error } = await supabase.from("products").insert({ id, ...parsed.data });
    if (error) return { error: "Não foi possível cadastrar. Tente novamente." };
  }

  updateTag(PRODUCTS_TAG);
  redirect("/admin/produtos?salvo=1");
}

export async function toggleProductActive(id: string, active: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").update({ active }).eq("id", id);
  if (error) throw new Error("Não foi possível alterar o produto.");
  updateTag(PRODUCTS_TAG);
  refresh();
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error("Não foi possível excluir o produto.");

  const path = storagePath(data?.image_url);
  if (path) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);

  updateTag(PRODUCTS_TAG);
  refresh();
}
