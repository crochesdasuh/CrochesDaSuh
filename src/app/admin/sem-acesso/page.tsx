import { ShieldAlert } from "lucide-react";

export default function NoAccessPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-amber-100 bg-white p-7 text-center shadow-sm">
        <ShieldAlert className="mx-auto size-10 text-terracota" />
        <h1 className="mt-4 font-serif text-2xl font-medium text-grafite">Sem acesso ao painel</h1>
        <p className="mt-2 text-sm text-cafe">
          Esta conta entrou, mas não está cadastrada como administradora do ateliê.
        </p>
        <form action="/admin/sair" method="post" className="mt-6">
          <button className="w-full rounded-2xl bg-terracota px-5 py-3 font-bold text-white hover:bg-terracota-escuro">
            Sair e entrar com outra conta
          </button>
        </form>
      </div>
    </main>
  );
}
