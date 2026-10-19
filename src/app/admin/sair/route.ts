import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Sair do painel: encerra a sessão no Supabase e manda o navegador apagar tudo
 * o que o site deixou nele (cache, cookies e armazenamento). O redirecionamento
 * recarrega a página inteira, então nenhuma tela do painel fica na memória.
 */
export async function POST(request: Request) {
  if (isSupabaseConfigured) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/admin/login", request.url).toString(),
      "Clear-Site-Data": '"cache", "cookies", "storage"',
      "Cache-Control": "no-store",
    },
  });
}
