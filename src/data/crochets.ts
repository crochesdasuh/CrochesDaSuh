// Dados estáticos do catálogo Crochês da Suh.
// Fotos, preços, depoimentos e número de WhatsApp são EXEMPLOS:
// substitua pelos dados reais da Suh antes de publicar.

export const WHATSAPP_NUMBER = "5511999999999"; // DDI + DDD + número, só dígitos
export const INSTAGRAM_HANDLE = "croches_dasuh";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export type CategoryId =
  | "todos"
  | "mesa"
  | "banheiro"
  | "bolsas"
  | "infantil"
  | "pronta-entrega";

export const categories: { id: CategoryId; label: string }[] = [
  { id: "todos", label: "Todos os Crochês" },
  { id: "mesa", label: "Mesa Posta & Cozinha" },
  { id: "banheiro", label: "Tapetes & Banheiro" },
  { id: "bolsas", label: "Bolsas & Acessórios" },
  { id: "infantil", label: "Infantil & Amigurumi" },
  { id: "pronta-entrega", label: "Kits Pronta Entrega" },
];

export type ColorPalette = {
  id: string;
  label: string;
  /** Cores das bolinhas de amostra no seletor. */
  swatches: string[];
  /** Personalizada: a cor é combinada direto no WhatsApp. */
  custom?: boolean;
};

export const colorPalettes: ColorPalette[] = [
  { id: "neutros", label: "Tons Neutros / Cru", swatches: ["#F3EBDD", "#D9C7A7", "#B49C7A"] },
  { id: "rosa-seco", label: "Rosa Seco & Bege", swatches: ["#E8C4B8", "#C98F84", "#E9DCC6"] },
  { id: "verde-menta", label: "Verde Menta", swatches: ["#CFE8DC", "#9CCBB4", "#F3EBDD"] },
  { id: "azul-nautico", label: "Azul Náutico", swatches: ["#1F3A5F", "#F3EBDD", "#9FB7CF"] },
  {
    id: "personalizada",
    label: "Personalizada / Falar no WhatsApp",
    swatches: ["#D97757", "#E29578", "#F2C879", "#8FB9A8"],
    custom: true,
  },
];

export type LeadTime = { type: "pronta" } | { type: "encomenda"; days: number };

export type Badge = "Mais Pedido" | "Pronta Entrega" | "Novidade" | "Feito sob Medida";

export type Product = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  imageAlt: string;
  categories: Exclude<CategoryId, "todos">[];
  priceFrom: number;
  leadTime: LeadTime;
  badges: Badge[];
  details: string[];
  quantity: {
    label: string;
    /** Rótulo usado na mensagem do WhatsApp, ex.: "lugares", "unidade(s)". */
    unit: string;
    options: number[];
  };
};

export const products: Product[] = [
  {
    id: "kit-mesa-posta",
    name: "Jogo Americano & Sousplat de Crochê",
    shortDescription: "Kit Mesa Posta em fio de malha com acabamento trabalhado.",
    description:
      "Jogo em fio de malha/barbante com acabamento trabalhado. Deixa a mesa do café ao jantar com cara de casa de vó — só que moderna. Cada lugar acompanha jogo americano e sousplat combinando.",
    image: "/images/jogo-americano.jpg",
    imageAlt: "Jogos americanos de crochê em tom cru dispostos lado a lado",
    categories: ["mesa"],
    priceFrom: 189,
    leadTime: { type: "encomenda", days: 5 },
    badges: ["Mais Pedido"],
    details: ["Barbante 100% algodão", "Sousplat de 35 cm", "Jogo americano 45 × 30 cm"],
    quantity: { label: "Quantidade de lugares", unit: "lugares", options: [4, 6, 8] },
  },
  {
    id: "jogo-banheiro-oval",
    name: "Tapete de Banheiro Oval em Crochê",
    shortDescription: "Jogo de banheiro 3 peças em algodão macio.",
    description:
      "Jogo de banheiro 3 peças em algodão macio: tapete oval, tampa de vaso e contorno. Fofinho para pisar, firme para não escorregar e lindo em qualquer cantinho.",
    image: "/images/tapete.jpg",
    imageAlt: "Tapete redondo de crochê em tons terrosos e azuis sobre o piso",
    categories: ["banheiro"],
    priceFrom: 159,
    leadTime: { type: "encomenda", days: 7 },
    badges: ["Feito sob Medida"],
    details: ["3 peças", "Algodão macio", "Pode ir à máquina no ciclo delicado"],
    quantity: { label: "Quantidade de jogos", unit: "jogo(s)", options: [1, 2, 3] },
  },
  {
    id: "bolsa-verao",
    name: "Bolsa de Crochê Verão / Casual",
    shortDescription: "Bolsa moderna em crochê estruturado com alça resistente.",
    description:
      "Bolsa moderna feita em crochê estruturado com alça resistente. Leve para a feira, a praia ou o passeio de domingo — cabe tudo e ainda arranca elogios.",
    image: "/images/bolsa.jpg",
    imageAlt: "Bolsa de crochê em trama aberta pendurada em um gancho",
    categories: ["bolsas", "pronta-entrega"],
    priceFrom: 129,
    leadTime: { type: "pronta" },
    badges: ["Pronta Entrega", "Novidade"],
    details: ["Alça reforçada", "Trama aberta e leve", "Aprox. 35 × 40 cm"],
    quantity: { label: "Quantidade", unit: "unidade(s)", options: [1, 2, 3] },
  },
  {
    id: "cesto-organizador",
    name: "Cesto Organizador Multiuso",
    shortDescription: "Cesto em fio de malha para quarto de bebê ou sala.",
    description:
      "Cesto em fio de malha para quarto de bebê ou organização de sala. Guarda fraldas, brinquedos, mantas e revistas com charme e aconchego.",
    image: "/images/cesto.jpg",
    imageAlt: "Cesto de crochê com quadradinhos coloridos e um ursinho de crochê dentro",
    categories: ["infantil", "pronta-entrega"],
    priceFrom: 89,
    leadTime: { type: "pronta" },
    badges: ["Pronta Entrega"],
    details: ["Fio de malha", "Estrutura firme", "Disponível em P, M e G"],
    quantity: { label: "Quantidade", unit: "unidade(s)", options: [1, 2, 3] },
  },
  {
    id: "centro-de-mesa-rendado",
    name: "Centro de Mesa em Crochê Rendado",
    shortDescription: "Peça elegante em pontilhado delicado para mesa de jantar.",
    description:
      "Peça elegante em pontilhado delicado para mesa de jantar. Um clássico que atravessa gerações e deixa a casa pronta para receber.",
    image: "/images/centro-mesa.jpg",
    imageAlt: "Centro de mesa redondo de crochê rendado em linha cru",
    categories: ["mesa"],
    priceFrom: 119,
    leadTime: { type: "encomenda", days: 6 },
    badges: ["Mais Pedido"],
    details: ["Linha 100% algodão", "Aprox. 60 cm de diâmetro", "Bordas em leque"],
    quantity: { label: "Quantidade", unit: "unidade(s)", options: [1, 2, 3] },
  },
  {
    id: "amigurumi-ursinho",
    name: "Ursinho Amigurumi",
    shortDescription: "Bichinho de crochê fofinho, perfeito para presentear.",
    description:
      "Ursinho amigurumi com enchimento antialérgico e olhinhos com trava de segurança. Companheiro de soneca e lembrança para a vida toda.",
    image: "/images/amigurumi.jpg",
    imageAlt: "Ursinho de crochê vermelho com flor na cabeça e blusinha listrada",
    categories: ["infantil"],
    priceFrom: 99,
    leadTime: { type: "encomenda", days: 10 },
    badges: ["Novidade"],
    details: ["Enchimento antialérgico", "Olhos com trava de segurança", "Aprox. 25 cm"],
    quantity: { label: "Quantidade", unit: "unidade(s)", options: [1, 2, 3] },
  },
  {
    id: "kit-porta-copos",
    name: "Kit Porta-Copos Listrado",
    shortDescription: "Porta-copos em crochê tunisiano, prontinho para enviar.",
    description:
      "Porta-copos em crochê tunisiano com listras alegres. Protege a mesa e dá aquele toque artesanal no cafezinho da tarde.",
    image: "/images/porta-copos.jpg",
    imageAlt: "Porta-copos de crochê amarelo-claro com listras vermelhas",
    categories: ["mesa", "pronta-entrega"],
    priceFrom: 49,
    leadTime: { type: "pronta" },
    badges: ["Pronta Entrega"],
    details: ["Crochê tunisiano", "Aprox. 12 × 12 cm", "Kit com estojo de presente"],
    quantity: { label: "Peças no kit", unit: "peças", options: [4, 6, 8] },
  },
];

export function formatLeadTime(leadTime: LeadTime) {
  return leadTime.type === "pronta"
    ? "Pronta Entrega"
    : `Sob Encomenda: ${leadTime.days} dias para confecção`;
}

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(product: Product, palette: ColorPalette, quantity: number) {
  const color = palette.custom ? "personalizada (vamos combinar por aqui)" : palette.label;
  return `Olá Dona Suh! Amei o seu trabalho no site. Gostaria de encomendar o ${product.name} na cor ${color}, quantidade: ${quantity} ${product.quantity.unit}. Como faço para confirmar meu pedido?`;
}

export const careTips = [
  {
    title: "Lave à mão, com carinho",
    text: "Use água fria ou morna e esfregue de leve, sem torcer. O crochê agradece o cuidado e mantém o ponto bonitinho.",
    icon: "hand",
  },
  {
    title: "Sabão neutro sempre",
    text: "Sabão de coco ou neutro preserva as fibras e as cores. Evite alvejante e amaciante em excesso.",
    icon: "droplets",
  },
  {
    title: "Seque à sombra, na horizontal",
    text: "Estenda a peça sobre uma toalha, longe do sol direto. Pendurada, ela pode esticar e perder o formato.",
    icon: "sun",
  },
  {
    title: "Guarde respirando",
    text: "Dobre sem apertar e guarde em saquinho de tecido. Assim seu crochê dura anos — e passa de geração em geração.",
    icon: "wind",
  },
] as const;

// EXEMPLOS: substitua por depoimentos reais (com autorização das clientes).
export const testimonials = [
  {
    name: "Mariana A.",
    city: "Campinas, SP",
    product: "Kit Mesa Posta",
    text: "O acabamento é impecável! Cada ponto certinho. Recebi as visitas no domingo e todo mundo perguntou de onde era.",
  },
  {
    name: "Juliana R.",
    city: "Belo Horizonte, MG",
    product: "Bolsa Verão",
    text: "Quando abri a caixa veio aquele cheirinho gostoso e um bilhetinho escrito à mão. Me senti abraçada!",
  },
  {
    name: "Patrícia L.",
    city: "Curitiba, PR",
    product: "Cesto Organizador",
    text: "A Suh me ajudou a escolher as cores pelo WhatsApp com toda a paciência. O cesto ficou a cara do quarto da minha filha.",
  },
];
