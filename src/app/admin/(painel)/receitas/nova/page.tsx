import { Suspense } from "react";
import RecipeForm from "@/components/admin/RecipeForm";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { getAdminProducts } from "@/lib/admin";

export default function NewRecipePage() {
  return (
    <>
      <PageHeader title="Nova receita" subtitle="Guarde o link, o PDF e uma foto de como ficou." />
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <NewRecipe />
      </Suspense>
    </>
  );
}

async function NewRecipe() {
  const products = await getAdminProducts();
  return <RecipeForm products={products.map((p) => ({ id: p.id, name: p.name }))} />;
}
