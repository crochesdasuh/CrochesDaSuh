"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Clock, Heart, ShoppingBag, Sparkles, Truck } from "lucide-react";
import {
  categories,
  formatPrice,
  type Badge,
  type CategoryId,
  type Product,
} from "@/data/crochets";
import { track } from "@/lib/track";
import ProductModal from "./ProductModal";

const badgeStyles: Record<Badge, string> = {
  "Mais Pedido": "bg-terracota text-white",
  "Pronta Entrega": "bg-whats-escuro text-white",
  Novidade: "bg-white/90 text-terracota-escuro ring-1 ring-terracota/30",
  "Feito sob Medida": "bg-white/90 text-cafe ring-1 ring-amber-200",
};

export default function Catalog({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("todos");
  const [selected, setSelected] = useState<Product | null>(null);

  const visible =
    activeCategory === "todos"
      ? products
      : products.filter((p) => p.categories.includes(activeCategory));

  return (
    <section id="catalogo" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-hand text-2xl text-terracota">feito ponto a ponto</p>
          <h2 className="mt-1 font-serif text-3xl font-medium text-grafite sm:text-4xl">
            Nosso Catálogo de Crochês
          </h2>
          <p className="mt-4 text-cafe">
            Toque em uma peça para escolher as cores, a quantidade e fazer seu pedido
            direto no WhatsApp.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Filtrar por ambiente"
          className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          {categories.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "border-terracota bg-terracota text-white shadow-md shadow-terracota/20"
                    : "border-amber-100 bg-white text-cafe hover:border-terracota/40 hover:text-terracota-escuro"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {visible.map((product, i) => (
            <li
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <ProductCard
                product={product}
                onOpen={() => {
                  setSelected(product);
                  track({ type: "product_view", productId: product.id });
                }}
              />
            </li>
          ))}
        </ul>

        {visible.length === 0 && (
          <p className="mt-10 text-center text-cafe">
            Nenhuma peça nesta categoria no momento — chama a Suh no WhatsApp que ela faz
            pra você!
          </p>
        )}
      </div>

      {selected && (
        <ProductModal key={selected.id} product={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const ready = product.leadTime.type === "pronta";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
    >
      <div className="relative aspect-[4/3.4] overflow-hidden bg-palha">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.badges.map((badge) => (
            <span
              key={badge}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${badgeStyles[badge]}`}
            >
              {badge === "Mais Pedido" && <Sparkles className="-mt-0.5 mr-1 inline size-3" />}
              {badge}
            </span>
          ))}
        </div>
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/85 text-rosa shadow-sm backdrop-blur transition-colors group-hover:text-terracota">
          <Heart className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p
          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
            ready ? "text-whats-escuro" : "text-terracota-escuro"
          }`}
        >
          {ready ? <Truck className="size-3.5" /> : <Clock className="size-3.5" />}
          {product.leadTime.type === "pronta"
            ? "Pronta Entrega"
            : `Sob encomenda · ${product.leadTime.days} dias`}
        </p>
        <h3 className="mt-2 font-serif text-xl font-medium leading-snug text-grafite">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-cafe">{product.shortDescription}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="text-sm text-cafe">
            a partir de
            <span className="block font-serif text-2xl font-semibold text-grafite">
              {formatPrice(product.priceFrom)}
            </span>
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rosa-claro px-4 py-2 text-sm font-bold text-terracota-escuro transition-colors group-hover:bg-terracota group-hover:text-white">
            <ShoppingBag className="size-4" />
            Personalizar
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}
