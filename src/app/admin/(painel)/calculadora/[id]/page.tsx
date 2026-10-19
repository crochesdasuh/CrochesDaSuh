import { Suspense } from "react";
import { notFound } from "next/navigation";
import PriceCalculator from "@/components/admin/PriceCalculator";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { getAdminProducts, getCalculation } from "@/lib/admin";

export default function EditCalculationPage({ params }: PageProps<"/admin/calculadora/[id]">) {
  return (
    <>
      <PageHeader title="Editar cálculo" subtitle="Ajuste os números e salve de novo." />
      <Suspense fallback={<Skeleton className="h-[36rem]" />}>
        <EditCalculation params={params} />
      </Suspense>
    </>
  );
}

async function EditCalculation({ params }: { params: PageProps<"/admin/calculadora/[id]">["params"] }) {
  const { id } = await params;
  const [calc, products] = await Promise.all([getCalculation(id), getAdminProducts()]);
  if (!calc) notFound();
  return (
    <PriceCalculator
      initial={{ id: calc.id, name: calc.name, productId: calc.product_id, notes: calc.notes, input: calc.input }}
      products={products.map((p) => ({ id: p.id, name: p.name, price: p.priceFrom }))}
    />
  );
}
