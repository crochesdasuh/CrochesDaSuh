"use client";

import { startTransition, useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, Save } from "lucide-react";
import { saveProduct } from "@/app/admin/actions";
import { categories, type Badge } from "@/data/crochets";
import type { AdminProduct } from "@/lib/products";
import { compressImage, imageExtension } from "@/lib/image";
import { uploadFile } from "@/lib/upload";

const BADGES: Badge[] = ["Mais Pedido", "Novidade", "Feito sob Medida", "Pronta Entrega"];
const EDITABLE_CATEGORIES = categories.filter((c) => c.id !== "todos" && c.id !== "pronta-entrega");

const QUANTITY_PRESETS = [
  { label: "Unidades", values: { label: "Quantidade", unit: "unidade(s)", options: "1, 2, 3" } },
  { label: "Lugares à mesa", values: { label: "Quantidade de lugares", unit: "lugares", options: "4, 6, 8" } },
  { label: "Peças no kit", values: { label: "Peças no kit", unit: "peças", options: "4, 6, 8" } },
];

const input =
  "mt-1.5 w-full rounded-xl border border-amber-100 bg-creme-claro px-4 py-2.5 text-grafite outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/20";
const labelText = "text-sm font-bold text-grafite";

type Props = { product?: AdminProduct; nextSortOrder?: number };

/**
 * O Next guarda páginas visitadas escondidas (Activity). A chave faz o
 * formulário começar limpo a cada visita nova, mas mantém o rascunho
 * quando a Suh usa o botão Voltar do navegador.
 */
export default function ProductForm(props: Props) {
  const { bfcacheId } = useRouter();
  return <ProductFormFields key={bfcacheId} {...props} />;
}

function ProductFormFields({ product, nextSortOrder = 0 }: Props) {
  const [state, action, saving] = useActionState(saveProduct, undefined);

  const [imageUrl, setImageUrl] = useState(product?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [ready, setReady] = useState(product?.leadTime.type === "pronta");
  const [quantity, setQuantity] = useState({
    label: product?.quantity.label ?? "Quantidade",
    unit: product?.quantity.unit ?? "unidade(s)",
    options: product?.quantity.options.join(", ") ?? "1, 2, 3",
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const blob = await compressImage(file);
      const { publicUrl } = await uploadFile("produto-foto", blob, imageExtension(blob));
      if (publicUrl) setImageUrl(publicUrl);
    } catch {
      setUploadError("Não foi possível enviar a foto. Tente outra imagem ou verifique a internet.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      // Envio manual: com <form action> o React 19 limpa os campos após o envio,
      // e a Suh perderia o que digitou se o servidor devolvesse um erro.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="grid gap-6 pb-24 lg:grid-cols-[20rem_1fr] lg:pb-0"
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />

      {/* Coluna da foto e status */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
          <span className={labelText}>Foto da peça</span>
          <label className="group relative mt-2 flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-amber-200 bg-creme-claro hover:border-terracota">
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill sizes="320px" className="object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 px-6 text-center text-sm text-cafe">
                <ImagePlus className="size-8 text-terracota" />
                Toque para escolher uma foto
              </span>
            )}
            {imageUrl && !uploading && (
              <span className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 py-1.5 text-center text-xs font-bold text-grafite opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Trocar foto
              </span>
            )}
            {uploading && (
              <span className="absolute inset-0 grid place-items-center bg-white/70">
                <LoaderCircle className="size-8 animate-spin text-terracota" />
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          {imageUrl && !uploading && (
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="mt-2 text-sm font-bold text-cafe hover:text-terracota-escuro"
            >
              Remover foto
            </button>
          )}
          {!imageUrl && (
            <p className="mt-2 text-xs text-cafe">Sem foto, o site mostra “foto em breve” no lugar.</p>
          )}
          {uploadError && <p className="mt-2 text-sm text-terracota-escuro">{uploadError}</p>}
          <label className="mt-4 block">
            <span className={labelText}>Descrição da foto</span>
            <input
              name="image_alt"
              defaultValue={product?.imageAlt}
              placeholder="Ex.: Tapete oval de crochê rosa seco"
              className={input}
            />
            <span className="mt-1 block text-xs text-cafe">Ajuda no Google e em leitores de tela.</span>
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className={labelText}>Mostrar no site</span>
              <span className="block text-xs text-cafe">Desmarque para esconder sem apagar.</span>
            </span>
            <input
              type="checkbox"
              name="active"
              defaultChecked={product?.active ?? true}
              className="size-5 accent-terracota"
            />
          </label>
          <label className="block">
            <span className={labelText}>Ordem no catálogo</span>
            <input
              name="sort_order"
              type="number"
              defaultValue={product?.sortOrder ?? nextSortOrder}
              className={input}
            />
            <span className="mt-1 block text-xs text-cafe">Números menores aparecem primeiro.</span>
          </label>
        </div>
      </div>

      {/* Dados da peça */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <label className="block">
            <span className={labelText}>Nome da peça *</span>
            <input name="name" required minLength={2} maxLength={120} defaultValue={product?.name} className={input} />
          </label>
          <label className="block">
            <span className={labelText}>Resumo (aparece no card)</span>
            <input
              name="short_description"
              maxLength={140}
              defaultValue={product?.shortDescription}
              className={input}
            />
          </label>
          <label className="block">
            <span className={labelText}>Descrição completa</span>
            <textarea name="description" rows={4} defaultValue={product?.description} className={input} />
          </label>
          <label className="block">
            <span className={labelText}>Detalhes (um por linha)</span>
            <textarea
              name="details"
              rows={3}
              defaultValue={product?.details.join("\n")}
              placeholder={"Barbante 100% algodão\nAprox. 35 cm"}
              className={input}
            />
          </label>
        </section>

        <section className="grid gap-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          <label className="block">
            <span className={labelText}>Preço “a partir de” (R$) *</span>
            <input
              name="price_from"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              defaultValue={product?.priceFrom}
              className={input}
            />
          </label>
          <div>
            <span className={labelText}>Prazo</span>
            <label className="mt-2.5 flex items-center gap-2 text-sm text-grafite">
              <input
                type="checkbox"
                name="pronta_entrega"
                checked={ready}
                onChange={(e) => setReady(e.target.checked)}
                className="size-5 accent-terracota"
              />
              Pronta entrega
            </label>
            {!ready && (
              <label className="mt-2 flex items-center gap-2 text-sm text-cafe">
                <input
                  name="lead_time_days"
                  type="number"
                  min={1}
                  max={120}
                  required
                  defaultValue={product?.leadTime.type === "encomenda" ? product.leadTime.days : 5}
                  className="w-20 rounded-xl border border-amber-100 bg-creme-claro px-3 py-2 text-grafite outline-none focus:border-terracota"
                />
                dias para confeccionar
              </label>
            )}
          </div>
        </section>

        <section className="grid gap-5 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          <fieldset>
            <legend className={labelText}>Categorias</legend>
            <div className="mt-2 space-y-2">
              {EDITABLE_CATEGORIES.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-grafite">
                  <input
                    type="checkbox"
                    name="categories"
                    value={c.id}
                    defaultChecked={product?.categories.includes(c.id as never)}
                    className="size-4 accent-terracota"
                  />
                  {c.label}
                </label>
              ))}
              <p className="text-xs text-cafe">“Kits Pronta Entrega” é automático pelo prazo.</p>
            </div>
          </fieldset>
          <fieldset>
            <legend className={labelText}>Selos no card</legend>
            <div className="mt-2 space-y-2">
              {BADGES.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm text-grafite">
                  <input
                    type="checkbox"
                    name="badges"
                    value={b}
                    defaultChecked={product?.badges.includes(b)}
                    className="size-4 accent-terracota"
                  />
                  {b}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <span className={labelText}>Seletor de quantidade</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUANTITY_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setQuantity(preset.values)}
                className="rounded-full border border-amber-100 bg-creme-claro px-3 py-1.5 text-xs font-bold text-cafe hover:border-terracota hover:text-terracota"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-bold text-cafe">Título</span>
              <input
                name="quantity_label"
                value={quantity.label}
                onChange={(e) => setQuantity({ ...quantity, label: e.target.value })}
                className={input}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-cafe">Unidade (vai na mensagem)</span>
              <input
                name="quantity_unit"
                value={quantity.unit}
                onChange={(e) => setQuantity({ ...quantity, unit: e.target.value })}
                className={input}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-cafe">Opções</span>
              <input
                name="quantity_options"
                value={quantity.options}
                onChange={(e) => setQuantity({ ...quantity, options: e.target.value })}
                placeholder="1, 2, 3"
                className={input}
              />
            </label>
          </div>
        </section>

        {/* Barra de salvar: fixa no rodapé no celular */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-amber-100 bg-white/95 px-4 py-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
          {state?.error && (
            <p role="alert" className="mb-3 rounded-xl bg-rosa-claro px-4 py-2.5 text-sm text-terracota-escuro">
              {state.error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/produtos" className="px-4 py-3 text-sm font-bold text-cafe hover:text-grafite">
              Cancelar
            </Link>
            <button
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-2xl bg-terracota px-6 py-3 font-bold text-white shadow-sm hover:bg-terracota-escuro disabled:opacity-60"
            >
              {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              {product ? "Salvar alterações" : "Cadastrar peça"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
