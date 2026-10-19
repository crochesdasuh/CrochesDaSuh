import { Suspense } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { getAdminProducts } from "@/lib/admin";

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Nova peça" subtitle="Preencha os dados e envie uma foto bonita da peça." />
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <NewProductForm />
      </Suspense>
    </>
  );
}

async function NewProductForm() {
  // Também confere se é admin antes de mostrar o formulário.
  const products = await getAdminProducts();
  const nextSortOrder = Math.max(0, ...products.map((p) => p.sortOrder)) + 10;
  return <ProductForm nextSortOrder={nextSortOrder} />;
}
