"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookHeart, CirclePlay, FileText, Search } from "lucide-react";
import { youtubeId, type RecipeView } from "@/lib/recipes";

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function RecipeGrid({
  recipes,
  productNames,
}: {
  recipes: RecipeView[];
  productNames: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const visible = q
    ? recipes.filter((r) =>
        normalize(
          [r.title, r.notes, r.product_id ? productNames[r.product_id] : "", ...r.links.map((l) => l.label)].join(" "),
        ).includes(q),
      )
    : recipes;

  return (
    <>
      <label className="relative mb-5 block">
        <span className="sr-only">Buscar receita</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cafe" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar: ursinho, tapete, agulha 2,5…"
          className="w-full rounded-2xl border border-amber-100 bg-white py-3 pl-11 pr-4 text-grafite shadow-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/20"
        />
      </label>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-amber-200 bg-white p-8 text-center text-cafe">
          Nenhuma receita encontrada para “{query}”.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((r) => {
            const video = r.links.find((l) => youtubeId(l.url));
            return (
              <li key={r.id} className="flex flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
                <Link href={`/admin/receitas/${r.id}`} className="group block">
                  <div className="relative aspect-square bg-palha">
                    {r.thumbnailUrl ? (
                      <Image
                        src={r.thumbnailUrl}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <BookHeart className="absolute inset-0 m-auto size-10 text-terracota/60" />
                    )}
                  </div>
                  <p className="line-clamp-2 px-3 pt-3 font-serif text-base font-medium leading-snug text-grafite group-hover:text-terracota">
                    {r.title}
                  </p>
                  {r.product_id && productNames[r.product_id] && (
                    <p className="truncate px-3 text-xs text-cafe">{productNames[r.product_id]}</p>
                  )}
                </Link>
                <div className="mt-auto flex flex-wrap gap-1.5 p-3">
                  {video && (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-terracota px-2.5 py-1 text-xs font-bold text-white hover:bg-terracota-escuro"
                    >
                      <CirclePlay className="size-3.5" /> Vídeo
                    </a>
                  )}
                  {r.files[0]?.url && (
                    <a
                      href={r.files[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-amber-200 px-2.5 py-1 text-xs font-bold text-terracota-escuro hover:border-terracota"
                    >
                      <FileText className="size-3.5" /> PDF{r.files.length > 1 ? ` ×${r.files.length}` : ""}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
