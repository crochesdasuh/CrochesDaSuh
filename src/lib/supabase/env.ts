export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** Sem as variáveis do Supabase o site usa o catálogo estático de `src/data/crochets.ts`. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const PRODUCT_IMAGES_BUCKET = "produtos";
