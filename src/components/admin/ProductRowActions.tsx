"use client";

import { useTransition } from "react";
import { Eye, EyeOff, LoaderCircle, Trash2 } from "lucide-react";
import { deleteProduct, toggleProductActive } from "@/app/admin/actions";

export default function ProductRowActions({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await fn();
      } catch {
        alert("Não deu certo. Verifique a internet e tente de novo.");
      }
    });

  if (pending) {
    return (
      <span className="grid size-10 place-items-center text-cafe">
        <LoaderCircle className="size-4 animate-spin" />
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => run(() => toggleProductActive(id, !active))}
        aria-label={active ? `Ocultar ${name} do site` : `Mostrar ${name} no site`}
        title={active ? "Ocultar do site" : "Mostrar no site"}
        className="grid size-10 place-items-center rounded-full text-cafe hover:bg-creme hover:text-terracota"
      >
        {active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Excluir “${name}”? Isso não pode ser desfeito.`)) run(() => deleteProduct(id));
        }}
        aria-label={`Excluir ${name}`}
        title="Excluir"
        className="grid size-10 place-items-center rounded-full text-cafe hover:bg-rosa-claro hover:text-terracota-escuro"
      >
        <Trash2 className="size-4" />
      </button>
    </>
  );
}
