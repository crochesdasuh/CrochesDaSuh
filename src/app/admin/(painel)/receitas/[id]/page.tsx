import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookHeart, CheckCircle2, ExternalLink, FileText, Pencil } from "lucide-react";
import DeleteRecipeButton from "@/components/admin/DeleteRecipeButton";
import { Card, Skeleton } from "@/components/admin/ui";
import { getAdminProducts, getRecipe } from "@/lib/admin";
import { formatFileSize, youtubeEmbed, youtubeId } from "@/lib/recipes";

export default function RecipePage({ params, searchParams }: PageProps<"/admin/receitas/[id]">) {
  return (
    <>
      <Link href="/admin/receitas" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-cafe hover:text-terracota">
        <ArrowLeft className="size-4" /> Todas as receitas
      </Link>
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <Recipe params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Recipe({
  params,
  searchParams,
}: {
  params: PageProps<"/admin/receitas/[id]">["params"];
  searchParams: PageProps<"/admin/receitas/[id]">["searchParams"];
}) {
  const [{ id }, { salvo }] = await Promise.all([params, searchParams]);
  const [recipe, products] = await Promise.all([getRecipe(id), getAdminProducts()]);
  if (!recipe) notFound();

  const product = products.find((p) => p.id === recipe.product_id);
  const videoId = recipe.links.map((l) => youtubeId(l.url)).find(Boolean);

  return (
    <>
      {salvo && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <CheckCircle2 className="size-4" /> Receita salva!
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-grafite">{recipe.title}</h1>
          {product && (
            <Link href={`/admin/produtos/${product.id}`} className="mt-1 inline-block text-sm text-cafe hover:text-terracota">
              Peça do catálogo: {product.name}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DeleteRecipeButton id={recipe.id} title={recipe.title} />
          <Link
            href={`/admin/receitas/${recipe.id}/editar`}
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-grafite hover:border-terracota"
          >
            <Pencil className="size-4" /> Editar
          </Link>
        </div>
      </div>

      {/* No celular o vídeo vem primeiro: é o que ela mais procura. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="order-2 space-y-5 lg:order-1">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-amber-100 bg-palha shadow-sm">
            {recipe.photoUrl ? (
              <Image src={recipe.photoUrl} alt={`Foto do trabalho: ${recipe.title}`} fill unoptimized className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center p-6 text-center text-sm text-cafe">
                <span>
                  <BookHeart className="mx-auto mb-2 size-10 text-terracota/60" />
                  Sem foto do trabalho. Edite a receita para adicionar uma.
                </span>
              </div>
            )}
          </div>
          {recipe.notes && (
            <Card>
              <h2 className="font-bold text-grafite">Anotações</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-grafite">{recipe.notes}</p>
            </Card>
          )}
        </div>

        <div className="order-1 space-y-5 lg:order-2">
          {videoId && (
            <div className="aspect-video overflow-hidden rounded-2xl border border-amber-100 bg-grafite shadow-sm">
              <iframe
                src={youtubeEmbed(videoId)}
                title={`Vídeo: ${recipe.title}`}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {recipe.links.length > 0 && (
            <Card>
              <h2 className="font-bold text-grafite">Vídeos e links</h2>
              <ul className="mt-3 space-y-2">
                {recipe.links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-amber-100 px-4 py-3 hover:border-terracota"
                    >
                      <ExternalLink className="size-4 shrink-0 text-terracota" />
                      <span className="min-w-0">
                        <span className="block font-semibold text-grafite">{l.label}</span>
                        <span className="block truncate text-xs text-cafe">{l.url}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {recipe.files.length > 0 && (
            <Card>
              <h2 className="font-bold text-grafite">PDFs e gráficos</h2>
              <ul className="mt-3 space-y-2">
                {recipe.files.map((f) => (
                  <li key={f.path}>
                    <a
                      href={f.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-amber-100 px-4 py-3 hover:border-terracota"
                    >
                      <FileText className="size-5 shrink-0 text-terracota" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-grafite">{f.name}</span>
                        <span className="text-xs text-cafe">{formatFileSize(f.size)} · abrir</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
