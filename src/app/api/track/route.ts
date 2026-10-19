import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

const TYPES = new Set(["page_view", "product_view", "whatsapp_click"]);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const text = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

// Recebe eventos anônimos do site (via sendBeacon) e grava no Supabase.
export async function POST(request: Request) {
  if (!isSupabaseConfigured) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const type = String(body.type);
  if (!TYPES.has(type)) return new Response(null, { status: 400 });

  const productId = text(body.productId, 80);
  const quantity = Number(body.quantity);

  const { error } = await createPublicClient()
    .from("events")
    .insert({
      type,
      product_id: productId && SLUG.test(productId) ? productId : null,
      palette: text(body.palette, 60),
      quantity: Number.isInteger(quantity) && quantity > 0 && quantity < 1000 ? quantity : null,
      session_id: text(body.sessionId, 64),
      referrer: text(body.referrer, 120),
      device: body.device === "mobile" ? "mobile" : "desktop",
    });

  // product_id inexistente (produto apagado) não deve quebrar o site.
  if (error && error.code !== "23503") console.error("Falha ao registrar evento", error);
  return new Response(null, { status: 204 });
}
