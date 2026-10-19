import { Suspense } from "react";
import Link from "next/link";
import { Calculator, CheckCircle2, Clock, Plus } from "lucide-react";
import DeleteCalculationButton from "@/components/admin/DeleteCalculationButton";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { formatPrice } from "@/data/crochets";
import { getAdminProducts, getCalculations } from "@/lib/admin";

export default function CalculatorListPage({ searchParams }: PageProps<"/admin/calculadora">) {
  return (
    <>
      <PageHeader
        title="Calculadora de preço"
        subtitle="Linha gasta + materiais + horas de trabalho = o preço justo da peça."
        action={
          <Link
            href="/admin/calculadora/nova"
            className="inline-flex items-center gap-2 rounded-2xl bg-terracota px-5 py-3 font-bold text-white shadow-sm hover:bg-terracota-escuro"
          >
            <Plus className="size-4" />
            Novo cálculo
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        }
      >
        <CalculationList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CalculationList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/calculadora">["searchParams"];
}) {
  const [{ salvo }, calculations, products] = await Promise.all([
    searchParams,
    getCalculations(),
    getAdminProducts(),
  ]);
  const productName = new Map(products.map((p) => [p.id, p.name]));

  return (
    <>
      {salvo && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <CheckCircle2 className="size-4" />
          Cálculo salvo!
        </p>
      )}
      {calculations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-10 text-center text-cafe">
          <Calculator className="mx-auto size-10 text-terracota" />
          <p className="mt-3">
            Nenhum cálculo ainda. Na próxima peça, pese os novelos antes de começar e marque o
            tempo — depois é só lançar aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {calculations.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"
            >
              <Link href={`/admin/calculadora/${c.id}`} className="min-w-0 flex-1">
                <p className="line-clamp-2 font-serif text-base font-medium leading-snug text-grafite hover:text-terracota sm:text-lg">
                  {c.name}
                </p>
                <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-cafe">
                  <span>Materiais {formatPrice(c.material_cost)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {c.total_hours.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h
                  </span>
                  {c.product_id && productName.has(c.product_id) && (
                    <span className="truncate">· {productName.get(c.product_id)}</span>
                  )}
                </p>
              </Link>
              <p className="shrink-0 text-right">
                <span className="block text-xs text-cafe">Preço</span>
                <span className="text-lg font-bold text-grafite">{formatPrice(c.price)}</span>
              </p>
              <DeleteCalculationButton id={c.id} name={c.name} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
