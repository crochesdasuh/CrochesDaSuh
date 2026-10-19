"use client";

import { startTransition, useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { signIn } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form
      // Envio manual para o React não limpar o e-mail quando a senha estiver errada.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="mt-6 space-y-4"
    >
      <label className="block">
        <span className="text-sm font-bold text-grafite">E-mail</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1.5 w-full rounded-xl border border-amber-100 bg-creme-claro px-4 py-3 outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-grafite">Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-xl border border-amber-100 bg-creme-claro px-4 py-3 outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/20"
        />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-rosa-claro px-4 py-2.5 text-sm text-terracota-escuro">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracota px-5 py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-terracota-escuro disabled:opacity-70"
      >
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        Entrar
      </button>
    </form>
  );
}
