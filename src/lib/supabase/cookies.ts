import type { CookieOptions } from "@supabase/ssr";

/** Sessão expira após 12 horas sem uso (cada acesso ao painel renova o prazo). */
export const SESSION_MAX_AGE = 60 * 60 * 12;

/**
 * Opções impostas a todo cookie de sessão do Supabase. O @supabase/ssr usa por
 * padrão cookies legíveis por JavaScript (httpOnly: false) e válidos por 400
 * dias; aqui o token fica inacessível a scripts da página e expira em 12 h.
 */
export function secureCookie(options: CookieOptions = {}): CookieOptions {
  const removing =
    options.maxAge === 0 || (options.expires !== undefined && new Date(options.expires).getTime() <= Date.now());
  return {
    ...options,
    path: "/",
    httpOnly: true,
    // Em produção só trafega por HTTPS. No `next dev` pela rede (http://192.168…) precisa ser false.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: removing ? 0 : SESSION_MAX_AGE,
    expires: undefined,
  };
}
