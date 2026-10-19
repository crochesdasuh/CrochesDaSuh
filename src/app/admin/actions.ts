"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { categories } from "@/data/crochets";
import { requireAdmin } from "@/lib/admin";
import { calculatePrice, type PricingInput } from "@/lib/pricing";
import { PRODUCTS_TAG } from "@/lib/products";
import {
  RECIPES_BUCKET,
  STORAGE_PATH,
  isHttpUrl,
  youtubeId,
  type RecipeFile,
  type RecipeLink,
} from "@/lib/recipes";
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

// ---------------------------------------------------------------- calculadora

const clamp = (value: unknown, max: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
};
const label = (value: unknown) => String(value ?? "").trim().slice(0, 80);

/** Nunca confia nos números vindos do navegador: limpa e recalcula aqui. */
function sanitizePricing(input: PricingInput): PricingInput {
  return {
    yarns: (Array.isArray(input.yarns) ? input.yarns : []).slice(0, 20).map((y) => ({
      name: label(y.name),
      skeinPrice: clamp(y.skeinPrice, 10_000),
      skeinWeight: clamp(y.skeinWeight, 100_000),
      weightBefore: clamp(y.weightBefore, 100_000),
      weightAfter: clamp(y.weightAfter, 100_000),
    })),
    extras: (Array.isArray(input.extras) ? input.extras : []).slice(0, 20).map((e) => ({
      name: label(e.name),
      cost: clamp(e.cost, 10_000),
    })),
    hours: Math.floor(clamp(input.hours, 2_000)),
    minutes: Math.floor(clamp(input.minutes, 59)),
    hourlyRate: clamp(input.hourlyRate, 10_000),
    marginPercent: clamp(input.marginPercent, 1_000),
    feePercent: clamp(input.feePercent, 50),
  };
}

export type SaveCalculationData = {
  id?: string;
  name: string;
  productId: string | null;
  notes: string;
  input: PricingInput;
};

export async function saveCalculation(data: SaveCalculationData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const name = String(data.name ?? "").trim().slice(0, 120);
  if (!name) return { error: "Dê um nome para o cálculo (ex.: Boneca Clara – rosa)." };

  const input = sanitizePricing(data.input);
  const result = calculatePrice(input);
  const row = {
    name,
    product_id: data.productId || null,
    notes: String(data.notes ?? "").slice(0, 2_000),
    input,
    material_cost: result.materialCost,
    labor_cost: result.laborCost,
    total_hours: Math.round(result.totalHours * 100) / 100,
    price: result.price,
  };

  const { error } = data.id
    ? await supabase.from("price_calculations").update(row).eq("id", data.id)
    : await supabase.from("price_calculations").insert(row);
  if (error) return { error: "Não foi possível salvar o cálculo. Tente novamente." };

  redirect("/admin/calculadora?salvo=1");
}

export async function deleteCalculation(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("price_calculations").delete().eq("id", id);
  if (error) throw new Error("Não foi possível excluir o cálculo.");
  refresh();
}

/** Usa o preço calculado como o "a partir de" da peça no site. */
export async function applyPriceToProduct(productId: string, price: number) {
  const { supabase } = await requireAdmin();
  const value = Math.round(clamp(price, 1_000_000) * 100) / 100;
  if (!value) throw new Error("Preço inválido.");
  const { error } = await supabase.from("products").update({ price_from: value }).eq("id", productId);
  if (error) throw new Error("Não foi possível atualizar o preço da peça.");
  updateTag(PRODUCTS_TAG);
}

// ---------------------------------------------------------------- receitas

export type SaveRecipeData = {
  id?: string;
  title: string;
  notes: string;
  productId: string | null;
  photoPath: string | null;
  links: RecipeLink[];
  files: RecipeFile[];
};

export async function saveRecipe(data: SaveRecipeData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const title = String(data.title ?? "").trim().slice(0, 120);
  if (!title) return { error: "Dê um nome para a receita (ex.: Ursinho de pelúcia – vídeo da Fulana)." };

  const links = (Array.isArray(data.links) ? data.links : [])
    .map((l) => ({ url: String(l.url ?? "").trim(), label: String(l.label ?? "").trim().slice(0, 80) }))
    .filter((l) => l.url)
    .slice(0, 10);
  const invalid = links.find((l) => !isHttpUrl(l.url));
  if (invalid) return { error: `Link inválido: “${invalid.url}”. Ele precisa começar com https://` };

  const files = (Array.isArray(data.files) ? data.files : [])
    .filter((f) => STORAGE_PATH.test(String(f.path)))
    .map((f) => ({ path: f.path, name: String(f.name ?? "arquivo").slice(0, 120), size: clamp(f.size, 25_000_000) }))
    .slice(0, 10);
  const photoPath = data.photoPath && STORAGE_PATH.test(data.photoPath) ? data.photoPath : null;

  const row = {
    title,
    notes: String(data.notes ?? "").slice(0, 5_000),
    product_id: data.productId || null,
    photo_path: photoPath,
    links: links.map((l) => ({ ...l, label: l.label || (youtubeId(l.url) ? "Vídeo no YouTube" : new URL(l.url).hostname) })),
    files,
  };

  let id = data.id;
  if (id) {
    const { data: before } = await supabase
      .from("recipes")
      .select("photo_path, files")
      .eq("id", id)
      .maybeSingle();
    const { error } = await supabase.from("recipes").update(row).eq("id", id);
    if (error) return { error: "Não foi possível salvar a receita. Tente novamente." };

    // Apaga do armazenamento a foto trocada e os arquivos removidos.
    const kept = new Set([photoPath, ...files.map((f) => f.path)]);
    const old = [before?.photo_path, ...((before?.files as RecipeFile[] | undefined) ?? []).map((f) => f.path)];
    const removed = old.filter((p): p is string => !!p && !kept.has(p));
    if (removed.length) await supabase.storage.from(RECIPES_BUCKET).remove(removed);
  } else {
    id = crypto.randomUUID();
    const { error } = await supabase.from("recipes").insert({ id, ...row });
    if (error) return { error: "Não foi possível cadastrar a receita. Tente novamente." };
  }

  redirect(`/admin/receitas/${id}?salvo=1`);
}

export async function deleteRecipe(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("recipes").select("photo_path, files").eq("id", id).maybeSingle();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error("Não foi possível excluir a receita.");

  const paths = [data?.photo_path, ...((data?.files as RecipeFile[] | undefined) ?? []).map((f) => f.path)].filter(
    (p): p is string => !!p,
  );
  if (paths.length) await supabase.storage.from(RECIPES_BUCKET).remove(paths);
  redirect("/admin/receitas");
}

// ---------------------------------------------------------------- envio de arquivos

const UPLOAD_KINDS = {
  "produto-foto": { bucket: PRODUCT_IMAGES_BUCKET, ext: ["webp", "jpg"] },
  "receita-foto": { bucket: RECIPES_BUCKET, ext: ["webp", "jpg"] },
  "receita-arquivo": { bucket: RECIPES_BUCKET, ext: ["pdf", "jpg", "png", "webp"] },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;

/**
 * Autoriza o envio de UM arquivo: o navegador recebe um ingresso de uso único
 * (válido por 2 horas) e manda o arquivo direto ao Supabase, sem precisar da
 * sessão da Suh no navegador.
 */
export async function createUploadTarget(kind: UploadKind, ext: string) {
  const { supabase } = await requireAdmin();
  const config = UPLOAD_KINDS[kind];
  if (!config || !(config.ext as readonly string[]).includes(ext)) throw new Error("Tipo de arquivo não permitido.");

  const path = `${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from(config.bucket).createSignedUploadUrl(path);
  if (error || !data) throw new Error("Não foi possível preparar o envio.");

  const publicUrl =
    config.bucket === PRODUCT_IMAGES_BUCKET
      ? supabase.storage.from(config.bucket).getPublicUrl(path).data.publicUrl
      : null;
  return { bucket: config.bucket, path, token: data.token, publicUrl };
}
