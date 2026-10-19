"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, LoaderCircle, Plus, Save, Scale, Trash2 } from "lucide-react";
import { applyPriceToProduct, saveCalculation } from "@/app/admin/actions";
import { calculatePrice, type PricingInput } from "@/lib/pricing";
import { uuid } from "@/lib/uuid";

type Text = string;
type YarnRow = {
  key: string;
  name: Text;
  skeinPrice: Text;
  skeinWeight: Text;
  weightBefore: Text;
  weightAfter: Text;
};
type ExtraRow = { key: string; name: Text; cost: Text };
type ProductOption = { id: string; name: string; price: number };

export type CalculatorInitial = {
  id?: string;
  name: string;
  productId: string | null;
  notes: string;
  input?: PricingInput;
  /** Num cálculo novo: valor da hora, lucro e taxa do último cálculo salvo. */
  defaults?: Pick<PricingInput, "hourlyRate" | "marginPercent" | "feePercent">;
};

const EXTRA_SUGGESTIONS = ["Enchimento", "Olhos com trava", "Embalagem", "Etiqueta", "Argola / alça"];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const grams = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} g`;
const num = (t: Text) => {
  const n = Number(String(t).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const str = (n: number | undefined) => (n ? String(n) : "");
const newKey = () => uuid();
const emptyYarn = (): YarnRow => ({
  key: newKey(),
  name: "",
  skeinPrice: "",
  skeinWeight: "",
  weightBefore: "",
  weightAfter: "",
});

const input =
  "mt-1 w-full rounded-xl border border-amber-100 bg-creme-claro px-3 py-2.5 text-grafite outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/20";
const small = "text-xs font-bold text-cafe";
const card = "rounded-2xl border border-amber-100 bg-white p-5 shadow-sm";

function toInput(
  yarns: YarnRow[],
  extras: ExtraRow[],
  t: { hours: Text; minutes: Text; hourlyRate: Text; margin: Text; fee: Text },
): PricingInput {
  return {
    yarns: yarns.map((y) => ({
      name: y.name,
      skeinPrice: num(y.skeinPrice),
      skeinWeight: num(y.skeinWeight),
      // Em branco = novelo cheio, recém-aberto.
      weightBefore: y.weightBefore === "" ? num(y.skeinWeight) : num(y.weightBefore),
      weightAfter: num(y.weightAfter),
    })),
    extras: extras.map((e) => ({ name: e.name, cost: num(e.cost) })),
    hours: num(t.hours),
    minutes: num(t.minutes),
    hourlyRate: num(t.hourlyRate),
    marginPercent: num(t.margin),
    feePercent: num(t.fee),
  };
}

/** Recomeça vazia a cada visita nova (o Next guarda páginas escondidas). */
export default function PriceCalculator(props: {
  initial: CalculatorInitial;
  products: ProductOption[];
}) {
  const { bfcacheId } = useRouter();
  return <Calculator key={bfcacheId} {...props} />;
}

function Calculator({ initial, products }: { initial: CalculatorInitial; products: ProductOption[] }) {
  const saved = initial.input;
  const [name, setName] = useState(initial.name);
  const [productId, setProductId] = useState(initial.productId ?? "");
  const [notes, setNotes] = useState(initial.notes);
  const [yarns, setYarns] = useState<YarnRow[]>(() =>
    saved?.yarns.length
      ? saved.yarns.map((y) => ({
          key: newKey(),
          name: y.name,
          skeinPrice: str(y.skeinPrice),
          skeinWeight: str(y.skeinWeight),
          weightBefore: str(y.weightBefore),
          weightAfter: String(y.weightAfter ?? ""),
        }))
      : [emptyYarn()],
  );
  const [extras, setExtras] = useState<ExtraRow[]>(() =>
    (saved?.extras ?? []).map((e) => ({ key: newKey(), name: e.name, cost: str(e.cost) })),
  );
  const [hours, setHours] = useState(str(saved?.hours));
  const [minutes, setMinutes] = useState(str(saved?.minutes));
  const base = saved ?? initial.defaults ?? { hourlyRate: 15, marginPercent: 20, feePercent: 0 };
  const [hourlyRate, setHourlyRate] = useState(str(base.hourlyRate));
  const [margin, setMargin] = useState(str(base.marginPercent));
  const [fee, setFee] = useState(str(base.feePercent));

  const [error, setError] = useState("");
  const [applied, setApplied] = useState<number | null>(null);
  const [saving, startSaving] = useTransition();
  const [applying, startApplying] = useTransition();

  const pricing = toInput(yarns, extras, { hours, minutes, hourlyRate, margin, fee });
  const r = calculatePrice(pricing);
  const product = products.find((p) => p.id === productId);
  const currentPrice = applied ?? product?.price;

  const updateYarn = (key: string, patch: Partial<YarnRow>) =>
    setYarns((list) => list.map((y) => (y.key === key ? { ...y, ...patch } : y)));
  const updateExtra = (key: string, patch: Partial<ExtraRow>) =>
    setExtras((list) => list.map((e) => (e.key === key ? { ...e, ...patch } : e)));

  function save() {
    setError("");
    startSaving(async () => {
      const res = await saveCalculation({ id: initial.id, name, productId: productId || null, notes, input: pricing });
      if (res?.error) setError(res.error);
    });
  }

  function applyPrice() {
    if (!product) return;
    const value = r.suggestedPrice;
    startApplying(async () => {
      try {
        await applyPriceToProduct(product.id, value);
        setApplied(value);
      } catch {
        setError("Não foi possível atualizar o preço da peça.");
      }
    });
  }

  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-[1fr_22rem] lg:items-start lg:pb-0">
      <div className="space-y-5">
        {/* Identificação */}
        <section className={`${card} grid gap-4 sm:grid-cols-2`}>
          <label className="block sm:col-span-2">
            <span className="text-sm font-bold text-grafite">Nome do cálculo *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Boneca Clara – vestido rosa"
              maxLength={120}
              className={input}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-grafite">Peça do catálogo (opcional)</span>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className={input}>
              <option value="">— nenhuma —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-grafite">Observações</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: agulha 2,5 mm, 2 dias"
              className={input}
            />
          </label>
        </section>

        {/* Linhas */}
        <section className={card}>
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rosa-claro text-terracota">
              <Scale className="size-5" />
            </span>
            <div>
              <h2 className="font-bold text-grafite">Linhas usadas</h2>
              <p className="text-sm text-cafe">
                Pese cada novelo na balança antes de começar e quando terminar. A diferença é o
                que a peça gastou.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-4">
            {yarns.map((y, i) => {
              const usage = r.yarns[i];
              return (
                <li key={y.key} className="rounded-xl border border-amber-100 bg-creme-claro/60 p-4">
                  <div className="flex items-end gap-2">
                    <label className="block flex-1">
                      <span className={small}>Linha / cor {i + 1}</span>
                      <input
                        value={y.name}
                        onChange={(e) => updateYarn(y.key, { name: e.target.value })}
                        placeholder="Ex.: Rosa seco – Amigurumi"
                        className={input}
                      />
                    </label>
                    {yarns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setYarns((list) => list.filter((x) => x.key !== y.key))}
                        aria-label={`Remover linha ${i + 1}`}
                        className="mb-0.5 grid size-11 place-items-center rounded-xl text-cafe hover:bg-rosa-claro hover:text-terracota-escuro"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <label className="block">
                      <span className={small}>Preço do novelo (R$)</span>
                      <input
                        type="number" inputMode="decimal" min="0" step="any"
                        value={y.skeinPrice}
                        onChange={(e) => updateYarn(y.key, { skeinPrice: e.target.value })}
                        placeholder="20,00"
                        className={input}
                      />
                    </label>
                    <label className="block">
                      <span className={small}>Peso do novelo (g)</span>
                      <input
                        type="number" inputMode="decimal" min="0" step="any"
                        value={y.skeinWeight}
                        onChange={(e) => updateYarn(y.key, { skeinWeight: e.target.value })}
                        placeholder="100"
                        className={input}
                      />
                    </label>
                    <label className="block">
                      <span className={small}>Pesava antes (g)</span>
                      <input
                        type="number" inputMode="decimal" min="0" step="any"
                        value={y.weightBefore}
                        onChange={(e) => updateYarn(y.key, { weightBefore: e.target.value })}
                        placeholder={y.skeinWeight ? `${y.skeinWeight} (cheio)` : "novelo cheio"}
                        className={input}
                      />
                    </label>
                    <label className="block">
                      <span className={small}>Sobrou depois (g)</span>
                      <input
                        type="number" inputMode="decimal" min="0" step="any"
                        value={y.weightAfter}
                        onChange={(e) => updateYarn(y.key, { weightAfter: e.target.value })}
                        placeholder="70"
                        className={input}
                      />
                    </label>
                  </div>
                  <p className={`mt-3 text-sm ${usage.invalid ? "text-terracota-escuro" : "text-cafe"}`}>
                    {usage.invalid ? (
                      "A sobra está maior que o peso de antes — confira se os pesos não ficaram trocados."
                    ) : (
                      <>
                        Gastou <strong className="text-grafite">{grams(usage.usedGrams)}</strong> ·{" "}
                        <strong className="text-grafite">{brl(usage.cost)}</strong> de linha
                        {usage.pricePerGram > 0 && <> ({brl(usage.pricePerGram)} por grama)</>}
                      </>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setYarns((list) => [...list, emptyYarn()])}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-terracota-escuro hover:border-terracota"
          >
            <Plus className="size-4" /> Adicionar outra linha
          </button>
        </section>

        {/* Outros materiais */}
        <section className={card}>
          <h2 className="font-bold text-grafite">Outros materiais</h2>
          <p className="text-sm text-cafe">O que mais entrou na peça (valor gasto nesta peça).</p>
          {extras.length > 0 && (
            <ul className="mt-4 space-y-3">
              {extras.map((e) => (
                <li key={e.key} className="flex items-end gap-2">
                  <label className="block flex-1">
                    <span className={small}>Material</span>
                    <input
                      value={e.name}
                      onChange={(ev) => updateExtra(e.key, { name: ev.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block w-28">
                    <span className={small}>Valor (R$)</span>
                    <input
                      type="number" inputMode="decimal" min="0" step="any"
                      value={e.cost}
                      onChange={(ev) => updateExtra(e.key, { cost: ev.target.value })}
                      className={input}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setExtras((list) => list.filter((x) => x.key !== e.key))}
                    aria-label={`Remover ${e.name || "material"}`}
                    className="mb-0.5 grid size-11 place-items-center rounded-xl text-cafe hover:bg-rosa-claro hover:text-terracota-escuro"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {[...EXTRA_SUGGESTIONS, ""].map((s) => (
              <button
                key={s || "outro"}
                type="button"
                onClick={() => setExtras((list) => [...list, { key: newKey(), name: s, cost: "" }])}
                className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-creme-claro px-3 py-1.5 text-xs font-bold text-cafe hover:border-terracota hover:text-terracota"
              >
                <Plus className="size-3" /> {s || "Outro"}
              </button>
            ))}
          </div>
        </section>

        {/* Tempo e valores */}
        <section className={`${card} grid gap-5 sm:grid-cols-2`}>
          <div>
            <h2 className="flex items-center gap-2 font-bold text-grafite">
              <Clock className="size-4 text-terracota" /> Tempo de trabalho
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className={small}>Horas</span>
                <input
                  type="number" inputMode="numeric" min="0" step="1"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className={input}
                />
              </label>
              <label className="block">
                <span className={small}>Minutos</span>
                <input
                  type="number" inputMode="numeric" min="0" max="59" step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="0"
                  className={input}
                />
              </label>
            </div>
            <label className="mt-3 block">
              <span className={small}>Valor da sua hora (R$)</span>
              <input
                type="number" inputMode="decimal" min="0" step="any"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={input}
              />
              <span className="mt-1 block text-xs text-cafe">
                Dica: quanto quer ganhar no mês ÷ horas que crocheta no mês.
              </span>
            </label>
          </div>
          <div>
            <h2 className="font-bold text-grafite">Lucro e taxas</h2>
            <label className="mt-3 block">
              <span className={small}>Lucro sobre o custo (%)</span>
              <input
                type="number" inputMode="decimal" min="0" step="any"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className={input}
              />
              <span className="mt-1 block text-xs text-cafe">Para reinvestir: linhas, agulhas, divulgação.</span>
            </label>
            <label className="mt-3 block">
              <span className={small}>Taxa da maquininha / parcelamento (%)</span>
              <input
                type="number" inputMode="decimal" min="0" max="50" step="any"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className={input}
              />
              <span className="mt-1 block text-xs text-cafe">Deixe 0 se recebe por Pix.</span>
            </label>
          </div>
        </section>
      </div>

      {/* Resultado */}
      <aside className="lg:sticky lg:top-32">
        <section className={card}>
          <h2 className="font-bold text-grafite">Preço da peça</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row label={`Linha (${grams(r.yarnGrams)})`} value={brl(r.yarnCost)} />
            <Row label="Outros materiais" value={brl(r.extrasCost)} />
            <Row
              label={`Mão de obra (${formatHours(r.totalHours)} × ${brl(num(hourlyRate))})`}
              value={brl(r.laborCost)}
            />
            <Row label="Custo total" value={brl(r.totalCost)} strong border />
            <Row label={`Lucro (${num(margin)}%)`} value={brl(r.profit)} />
            {r.feeValue > 0 && <Row label={`Taxa (${num(fee)}%)`} value={brl(r.feeValue)} />}
          </dl>
          <div className="mt-4 rounded-xl bg-rosa-claro/70 p-4">
            <p className="text-sm text-cafe">Preço calculado</p>
            <p className="text-3xl font-bold text-grafite">{brl(r.price)}</p>
            <p className="mt-1 text-sm text-cafe">
              Sugestão arredondada: <strong className="text-grafite">{brl(r.suggestedPrice)}</strong>
            </p>
          </div>

          {product && currentPrice !== undefined && (
            <div className="mt-4 rounded-xl border border-amber-100 p-4 text-sm">
              <p className="text-cafe">
                Preço no site hoje ({product.name}):{" "}
                <strong className="text-grafite">{brl(currentPrice)}</strong>
              </p>
              {applied !== null ? (
                <p className="mt-2 flex items-center gap-1.5 font-semibold text-green-800">
                  <CheckCircle2 className="size-4" /> Preço do site atualizado!
                </p>
              ) : (
                currentPrice !== r.suggestedPrice &&
                r.suggestedPrice > 0 && (
                  <button
                    type="button"
                    onClick={applyPrice}
                    disabled={applying}
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-terracota px-4 py-2 font-bold text-terracota-escuro hover:bg-rosa-claro disabled:opacity-60"
                  >
                    {applying && <LoaderCircle className="size-4 animate-spin" />}
                    Usar {brl(r.suggestedPrice)} no site
                  </button>
                )
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-rosa-claro px-4 py-2.5 text-sm text-terracota-escuro">
              {error}
            </p>
          )}
          <div className="mt-5 hidden items-center justify-end gap-3 lg:flex">
            <Link href="/admin/calculadora" className="px-3 py-3 text-sm font-bold text-cafe hover:text-grafite">
              Cancelar
            </Link>
            <SaveButton onClick={save} saving={saving} />
          </div>
        </section>
      </aside>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-amber-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="leading-tight">
          <p className="text-xs text-cafe">Preço sugerido</p>
          <p className="text-xl font-bold text-grafite">{brl(r.suggestedPrice)}</p>
        </div>
        <SaveButton onClick={save} saving={saving} />
      </div>
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-2 rounded-2xl bg-terracota px-5 py-3 font-bold text-white shadow-sm hover:bg-terracota-escuro disabled:opacity-60"
    >
      {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
      Salvar cálculo
    </button>
  );
}

function Row({ label, value, strong, border }: { label: string; value: string; strong?: boolean; border?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${border ? "border-t border-amber-100 pt-2.5" : ""}`}>
      <dt className={strong ? "font-bold text-grafite" : "text-cafe"}>{label}</dt>
      <dd className={`shrink-0 tabular-nums ${strong ? "font-bold text-grafite" : "text-grafite"}`}>{value}</dd>
    </div>
  );
}

function formatHours(total: number) {
  const h = Math.floor(total);
  const m = Math.round((total - h) * 60);
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}
