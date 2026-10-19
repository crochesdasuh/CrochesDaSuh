import { Suspense } from "react";
import PriceCalculator from "@/components/admin/PriceCalculator";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { getAdminProducts, getCalculations } from "@/lib/admin";

export default function NewCalculationPage() {
  return (
    <>
      <PageHeader title="Novo cálculo" subtitle="O preço é recalculado a cada número que você digita." />
      <Suspense fallback={<Skeleton className="h-[36rem]" />}>
        <NewCalculation />
      </Suspense>
    </>
  );
}

async function NewCalculation() {
  const [products, [last]] = await Promise.all([getAdminProducts(), getCalculations()]);
  return (
    <PriceCalculator
      initial={{
        name: "",
        productId: null,
        notes: "",
        defaults: last && {
          hourlyRate: last.input.hourlyRate,
          marginPercent: last.input.marginPercent,
          feePercent: last.input.feePercent,
        },
      }}
      products={products.map((p) => ({ id: p.id, name: p.name, price: p.priceFrom }))}
    />
  );
}
