// Cálculo do preço de uma peça de crochê: linha gasta (pesando o novelo antes
// e depois), outros materiais, horas de trabalho, lucro e taxa de cartão.

export type YarnItem = {
  /** Cor ou nome da linha, ex.: "Rosa seco – Amigurumi Pelúcia". */
  name: string;
  /** Preço pago pelo novelo inteiro (R$). */
  skeinPrice: number;
  /** Peso do novelo inteiro, como vem na etiqueta (g). */
  skeinWeight: number;
  /** Quanto o novelo pesava antes de começar a peça (g). */
  weightBefore: number;
  /** Quanto sobrou depois de terminar a peça (g). */
  weightAfter: number;
};

export type ExtraItem = {
  /** Ex.: enchimento, olhos com trava, embalagem, etiqueta. */
  name: string;
  cost: number;
};

export type PricingInput = {
  yarns: YarnItem[];
  extras: ExtraItem[];
  hours: number;
  minutes: number;
  /** Quanto a Suh quer ganhar por hora de trabalho (R$). */
  hourlyRate: number;
  /** Lucro sobre o custo total (%), para reinvestir no ateliê. */
  marginPercent: number;
  /** Taxa da maquininha / Pix parcelado etc. (%), cobrada sobre o preço final. */
  feePercent: number;
};

const money = (n: number) => Math.round(n * 100) / 100;
const num = (n: number) => (Number.isFinite(n) ? n : 0);

export function yarnUsage(y: YarnItem) {
  const used = Math.max(0, num(y.weightBefore) - num(y.weightAfter));
  const pricePerGram = num(y.skeinWeight) > 0 ? num(y.skeinPrice) / y.skeinWeight : 0;
  return {
    usedGrams: used,
    pricePerGram,
    cost: money(used * pricePerGram),
    /** Sobra maior que o peso antes: provavelmente os pesos foram trocados. */
    invalid: num(y.weightAfter) > num(y.weightBefore),
  };
}

export function calculatePrice(input: PricingInput) {
  const yarns = input.yarns.map(yarnUsage);
  const yarnCost = money(yarns.reduce((sum, y) => sum + y.cost, 0));
  const yarnGrams = yarns.reduce((sum, y) => sum + y.usedGrams, 0);
  const extrasCost = money(input.extras.reduce((sum, e) => sum + Math.max(0, num(e.cost)), 0));
  const materialCost = money(yarnCost + extrasCost);

  const totalHours = Math.max(0, num(input.hours)) + Math.max(0, num(input.minutes)) / 60;
  const laborCost = money(totalHours * Math.max(0, num(input.hourlyRate)));

  const totalCost = money(materialCost + laborCost);
  const profit = money(totalCost * (Math.max(0, num(input.marginPercent)) / 100));

  // A taxa é descontada do valor recebido, então o preço precisa "embutir" a taxa:
  // preço × (1 − taxa) = custo + lucro.
  const fee = Math.min(Math.max(0, num(input.feePercent)), 90) / 100;
  const price = money((totalCost + profit) / (1 - fee));
  const feeValue = money(price - totalCost - profit);

  return {
    yarns,
    yarnGrams,
    yarnCost,
    extrasCost,
    materialCost,
    totalHours,
    laborCost,
    totalCost,
    profit,
    feeValue,
    price,
    /** Preço arredondado para cima no próximo múltiplo de R$ 5. */
    suggestedPrice: Math.ceil(price / 5) * 5,
  };
}

export type PricingResult = ReturnType<typeof calculatePrice>;
