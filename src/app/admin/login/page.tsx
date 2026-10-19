import Link from "next/link";
import { Logo } from "@/components/icons";
import LoginForm from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  return (
    <main className="bg-pontinhos flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo layout="stacked" />
        </div>
        <div className="rounded-3xl border border-amber-100 bg-white p-7 shadow-sm">
          <h1 className="font-serif text-2xl font-medium text-grafite">Entrar no painel</h1>
          <p className="mt-1 text-sm text-cafe">Cadastre peças e acompanhe os pedidos.</p>
          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <p className="mt-6 rounded-2xl bg-rosa-claro px-4 py-3 text-sm text-terracota-escuro">
              O painel ainda não está conectado ao Supabase. Configure as variáveis{" "}
              <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
              (veja o README).
            </p>
          )}
        </div>
        <Link href="/" className="mt-6 block text-center text-sm text-cafe hover:text-terracota">
          ← Voltar para o site
        </Link>
      </div>
    </main>
  );
}
