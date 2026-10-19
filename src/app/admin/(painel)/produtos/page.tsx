import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, Pencil, Plus, Truck } from "lucide-react";
import ProductRowActions from "@/components/admin/ProductRowActions";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { formatPrice } from "@/data/crochets";
import { getAdminProducts } from "@/lib/admin";

export default function ProductsPage({ searchParams }: PageProps<"/admin/produtos">) {
  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle="O que estiver ativo aparece no catálogo do site."
        action={
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 rounded-2xl bg-terracota px-5 py-3 font-bold text-white shadow-sm hover:bg-terracota-escuro"
          >
            <Plus className="size-4" />
            Nova peça
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        }
      >
        <ProductList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProductList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/produtos">["searchParams"];
}) {
  const [{ salvo }, products] = await Promise.all([searchParams, getAdminProducts()]);

  return (
    <>
      {salvo && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <CheckCircle2 className="size-4" />
          Produto salvo! O site já foi atualizado.
        </p>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-10 text-center text-cafe">
          Nenhuma peça cadastrada ainda. Que tal começar pela primeira?
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className={`flex items-center gap-3 rounded-2xl sm:gap-4 border border-amber-100 bg-white p-3 shadow-sm sm:p-4 ${
                p.active ? "" : "opacity-70"
              }`}
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-palha sm:size-20">
                <Image src={p.image} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className="line-clamp-2 font-serif text-base font-medium leading-snug text-grafite hover:text-terracota sm:text-lg"
                  >
                    {p.name}
                  </Link>
                  {!p.active && (
                    <span className="rounded-full bg-creme px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-cafe">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-cafe">
                  <span className="font-semibold text-grafite">{formatPrice(p.priceFrom)}</span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    {p.leadTime.type === "pronta" ? (
                      <>
                        <Truck className="size-3.5" /> Pronta entrega
                      </>
                    ) : (
                      <>
                        <Clock className="size-3.5" /> {p.leadTime.days} dias
                      </>
                    )}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center sm:gap-1">
                <Link
                  href={`/admin/produtos/${p.id}`}
                  aria-label={`Editar ${p.name}`}
                  className="grid size-10 place-items-center rounded-full text-cafe hover:bg-creme hover:text-terracota"
                >
                  <Pencil className="size-4" />
                </Link>
                <ProductRowActions id={p.id} name={p.name} active={p.active} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
