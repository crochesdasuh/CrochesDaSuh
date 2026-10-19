import { Suspense } from "react";
import { notFound } from "next/navigation";
import RecipeForm from "@/components/admin/RecipeForm";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { getAdminProducts, getRecipe } from "@/lib/admin";

export default function EditRecipePage({ params }: PageProps<"/admin/receitas/[id]/editar">) {
  return (
    <>
      <PageHeader title="Editar receita" />
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <EditRecipe params={params} />
      </Suspense>
    </>
  );
}

async function EditRecipe({ params }: { params: PageProps<"/admin/receitas/[id]/editar">["params"] }) {
  const { id } = await params;
  const [recipe, products] = await Promise.all([getRecipe(id), getAdminProducts()]);
  if (!recipe) notFound();
  return <RecipeForm recipe={recipe} products={products.map((p) => ({ id: p.id, name: p.name }))} />;
}
