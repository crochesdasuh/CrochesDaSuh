import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { getAdminProduct } from "@/lib/admin";

export default function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  return (
    <>
      <PageHeader title="Editar peça" subtitle="As mudanças aparecem no site assim que você salvar." />
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <EditProductForm params={params} />
      </Suspense>
    </>
  );
}

async function EditProductForm({ params }: { params: PageProps<"/admin/produtos/[id]">["params"] }) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();
  return <ProductForm product={product} />;
}
