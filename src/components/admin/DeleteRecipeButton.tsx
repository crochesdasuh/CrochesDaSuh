"use client";

import { useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { deleteRecipe } from "@/app/admin/actions";

export default function DeleteRecipeButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Excluir a receita “${title}”? A foto e os PDFs também serão apagados.`)) return;
        startTransition(async () => {
          try {
            await deleteRecipe(id);
          } catch (e) {
            // redirect() da Server Action chega aqui como navegação, não como erro.
            if (!(e instanceof Error) || !e.message.includes("NEXT_REDIRECT")) {
              alert("Não deu certo. Verifique a internet e tente de novo.");
            }
          }
        });
      }}
      className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-cafe hover:bg-rosa-claro hover:text-terracota-escuro"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      Excluir
    </button>
  );
}
