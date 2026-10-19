"use client";

import { useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { deleteCalculation } from "@/app/admin/actions";

export default function DeleteCalculationButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Excluir o cálculo “${name}”?`)) return;
        startTransition(async () => {
          try {
            await deleteCalculation(id);
          } catch {
            alert("Não deu certo. Verifique a internet e tente de novo.");
          }
        });
      }}
      aria-label={`Excluir cálculo ${name}`}
      className="grid size-10 shrink-0 place-items-center rounded-full text-cafe hover:bg-rosa-claro hover:text-terracota-escuro"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  );
}
