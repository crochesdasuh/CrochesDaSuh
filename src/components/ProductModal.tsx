"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, Heart, MessageCircle, Minus, Plus, ShieldCheck, Truck, X } from "lucide-react";
import {
  colorPalettes,
  formatLeadTime,
  formatPrice,
  type Product,
} from "@/data/crochets";
import { track } from "@/lib/track";
import ProductPhoto from "./ProductPhoto";

type Props = { product: Product; onClose: () => void };

export default function ProductModal({ product, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [paletteId, setPaletteId] = useState(colorPalettes[0].id);
  const [quantity, setQuantity] = useState(product.quantity.options[0]);

  const palette = colorPalettes.find((p) => p.id === paletteId) ?? colorPalettes[0];
  const ready = product.leadTime.type === "pronta";
  // O número do WhatsApp fica só no servidor: /whatsapp monta a mensagem e redireciona.
  const orderUrl = `/whatsapp?${new URLSearchParams({ peca: product.id, cor: palette.id, qtd: String(quantity) })}`;
  const qtyIndex = product.quantity.options.indexOf(quantity);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    // Não chamar dialog.close() aqui: o evento "close" dispararia onClose e,
    // no StrictMode (dev), fecharia o modal logo após abrir. Ao desmontar,
    // o <dialog> sai do DOM e o modo modal termina sozinho.
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="mx-auto mb-0 mt-auto max-h-[94dvh] w-full max-w-full overflow-hidden rounded-t-3xl bg-transparent p-0 sm:my-auto sm:max-h-[90dvh] sm:max-w-4xl sm:rounded-3xl"
    >
      <div className="animate-fade-up grid max-h-[94dvh] overflow-y-auto bg-creme-claro sm:max-h-[90dvh] md:grid-cols-[1.05fr_1fr]">
        {/* Foto */}
        <div className="relative aspect-[4/3] bg-palha md:aspect-auto md:min-h-full">
          <ProductPhoto
            src={product.image}
            alt={product.imageAlt || product.name}
            sizes="(min-width: 768px) 450px, 100vw"
            priority
          />
          <span
            className={`absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-md ${
              ready ? "bg-whats-escuro text-white" : "bg-white text-terracota-escuro"
            }`}
          >
            {ready ? <Truck className="size-3.5" /> : <Clock className="size-3.5" />}
            {formatLeadTime(product.leadTime)}
          </span>
        </div>

        {/* Personalização */}
        <div className="relative flex flex-col p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            autoFocus
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-amber-100 bg-white text-cafe transition-colors hover:text-terracota"
          >
            <X className="size-4" />
          </button>

          <p className="font-hand text-xl text-terracota">feito à mão pra você</p>
          <h2 id="modal-title" className="pr-10 font-serif text-2xl font-medium leading-tight text-grafite sm:text-3xl">
            {product.name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-cafe">{product.description}</p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {product.details.map((d) => (
              <li
                key={d}
                className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-white px-3 py-1 text-xs text-cafe"
              >
                <Check className="size-3 text-whats-escuro" />
                {d}
              </li>
            ))}
          </ul>

          {/* Cores */}
          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-grafite">
              Paleta de cores preferida
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {colorPalettes.map((p) => {
                const active = p.id === paletteId;
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all has-focus-visible:outline-2 has-focus-visible:outline-terracota ${
                      p.custom ? "col-span-2" : ""
                    } ${
                      active
                        ? "border-terracota bg-rosa-claro/60 text-grafite shadow-sm"
                        : "border-amber-100 bg-white text-cafe hover:border-terracota/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="palette"
                      value={p.id}
                      checked={active}
                      onChange={() => setPaletteId(p.id)}
                      className="sr-only"
                    />
                    <span className="flex shrink-0 -space-x-1.5">
                      {p.swatches.map((c) => (
                        <span
                          key={c}
                          className="size-4 rounded-full ring-2 ring-white"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </span>
                    <span className="flex-1">{p.label}</span>
                    {active && <Check className="size-4 shrink-0 text-terracota" />}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Quantidade */}
          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-grafite">{product.quantity.label}</legend>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                aria-label="Diminuir"
                disabled={qtyIndex <= 0}
                onClick={() => setQuantity(product.quantity.options[qtyIndex - 1])}
                className="grid size-10 place-items-center rounded-full border border-amber-100 bg-white text-cafe transition-colors hover:text-terracota disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <div className="flex flex-1 gap-2">
                {product.quantity.options.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={n === quantity}
                    onClick={() => setQuantity(n)}
                    className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-all ${
                      n === quantity
                        ? "border-terracota bg-terracota text-white shadow-sm"
                        : "border-amber-100 bg-white text-cafe hover:border-terracota/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Aumentar"
                disabled={qtyIndex >= product.quantity.options.length - 1}
                onClick={() => setQuantity(product.quantity.options[qtyIndex + 1])}
                className="grid size-10 place-items-center rounded-full border border-amber-100 bg-white text-cafe transition-colors hover:text-terracota disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-cafe">
              Precisa de outra quantidade? É só avisar na conversa.
            </p>
          </fieldset>

          {/* Pedido */}
          <div className="sticky bottom-0 -mx-6 mt-7 border-t border-amber-100 bg-creme-claro/95 px-6 pb-5 pt-5 backdrop-blur sm:-mx-8 sm:px-8 md:static md:mx-0 md:bg-transparent md:px-0 md:pb-0 md:backdrop-blur-none">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-cafe">Valor a partir de</span>
              <span className="font-serif text-2xl font-semibold text-grafite">
                {formatPrice(product.priceFrom)}
              </span>
            </div>
            <a
              href={orderUrl}
              onClick={() =>
                track({
                  type: "whatsapp_click",
                  productId: product.id,
                  palette: palette.label,
                  quantity,
                })
              }
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-whats px-6 py-4 text-base font-bold text-white shadow-md shadow-whats/30 transition-all hover:-translate-y-0.5 hover:bg-whats-escuro"
            >
              <MessageCircle className="size-5" />
              Fazer Pedido no WhatsApp
            </a>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-cafe">
              <ShieldCheck className="size-3.5 text-whats-escuro" />
              Sem compromisso: a Suh confirma valores e prazo com você
              <Heart className="size-3 fill-rosa text-rosa" />
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
