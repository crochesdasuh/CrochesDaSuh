import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Cliente com a sessão do usuário (cookies). Use dentro de <Suspense> ou Server Actions. */
export async function createSessionClient() {
  // O cliente de auth lê o relógio (Date.now) ao iniciar: só pode rodar na
  // requisição de verdade, nunca no pré-render do prefetch.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components não podem gravar cookies; o proxy renova a sessão.
        }
      },
    },
  });
}

/** Cliente anônimo, sem cookies: pode rodar dentro de "use cache". */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
