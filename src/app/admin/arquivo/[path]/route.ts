import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";
import { RECIPES_BUCKET, STORAGE_PATH } from "@/lib/recipes";

const PRIVATE = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};

/**
 * Abre um arquivo privado das receitas. A página nunca recebe um link direto:
 * a cada acesso o login é conferido e o navegador é enviado a um link que
 * expira em 60 segundos. Sem sessão de admin, responde 404.
 */
export async function GET(_: Request, { params }: RouteContext<"/admin/arquivo/[path]">) {
  const { path } = await params;
  if (!isSupabaseConfigured || !STORAGE_PATH.test(path)) {
    return new Response("Arquivo não encontrado.", { status: 404, headers: PRIVATE });
  }

  const supabase = await createSessionClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return new Response("Arquivo não encontrado.", { status: 404, headers: PRIVATE });

  // As regras do banco só deixam a admin gerar este link.
  const { data, error } = await supabase.storage.from(RECIPES_BUCKET).createSignedUrl(path, 60);
  if (error || !data) return new Response("Arquivo não encontrado.", { status: 404, headers: PRIVATE });

  return new Response(null, { status: 302, headers: { ...PRIVATE, Location: data.signedUrl } });
}
