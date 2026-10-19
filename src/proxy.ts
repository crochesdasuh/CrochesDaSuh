import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

// Renova a sessão do Supabase e manda quem não está logado para o login.
// É só uma checagem otimista: cada página e Server Action do /admin
// confere de novo se o usuário é administrador.
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!isSupabaseConfigured) {
    return isLogin ? NextResponse.next() : redirectTo(request, "/admin/login");
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);

  if (!loggedIn && !isLogin) return redirectTo(request, "/admin/login");
  if (loggedIn && isLogin) return redirectTo(request, "/admin");
  return response;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
