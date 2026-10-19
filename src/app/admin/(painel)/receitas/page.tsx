import { Suspense } from "react";
import Link from "next/link";
import { BookHeart, Plus } from "lucide-react";
import RecipeGrid from "@/components/admin/RecipeGrid";
import { PageHeader, Skeleton } from "@/components/admin/ui";
import { getAdminProducts, getRecipes } from "@/lib/admin";

export default function RecipesPage() {
  return (
    <>
      <PageHeader
        title="Receitas"
        subtitle="Vídeos, PDFs e fotos de cada trabalho — para achar rapidinho quando a encomenda voltar."
        action={
          <Link
            href="/admin/receitas/nova"
            className="inline-flex items-center gap-2 rounded-2xl bg-terracota px-5 py-3 font-bold text-white shadow-sm hover:bg-terracota-escuro"
          >
            <Plus className="size-4" />
            Nova receita
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        }
      >
        <RecipeList />
      </Suspense>
    </>
  );
}

async function RecipeList() {
  const [recipes, products] = await Promise.all([getRecipes(), getAdminProducts()]);
  if (recipes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-10 text-center text-cafe">
        <BookHeart className="mx-auto size-10 text-terracota" />
        <p className="mt-3">
          Nenhuma receita guardada ainda. Na próxima peça feita por vídeo ou PDF, salve aqui o
          link e uma foto do resultado.
        </p>
      </div>
    );
  }
  return <RecipeGrid recipes={recipes} productNames={Object.fromEntries(products.map((p) => [p.id, p.name]))} />;
}
