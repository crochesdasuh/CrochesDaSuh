import Image from "next/image";
import {
  ArrowRight,
  Coffee,
  Droplets,
  Hand,
  Heart,
  MessageCircle,
  Palette,
  Gift,
  Quote,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Truck,
  Wind,
} from "lucide-react";
import Catalog from "@/components/Catalog";
import PageViewTracker from "@/components/PageViewTracker";
import { InstagramIcon, Logo } from "@/components/icons";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  careTips,
  testimonials,
  whatsappLink,
} from "@/data/crochets";
import { getCatalogProducts } from "@/lib/products";

const greetingUrl = whatsappLink(
  "Olá Dona Suh! Vim pelo site e queria conversar sobre uma peça de crochê. 🧶",
);

const navLinks = [
  { href: "#catalogo", label: "Catálogo" },
  { href: "#cuidados", label: "Cuidados" },
  { href: "#sobre", label: "Sobre a Suh" },
  { href: "#depoimentos", label: "Depoimentos" },
];

const differentials = [
  { icon: Scissors, title: "100% Feito à Mão", text: "Ponto a ponto, sem máquina" },
  { icon: Palette, title: "Escolha suas Cores", text: "Paletas ou personalizada" },
  { icon: Gift, title: "Embalagem Cheirosa & Especial", text: "Chega pronta pra presentear" },
  { icon: MessageCircle, title: "Atendimento Pessoal no WhatsApp", text: "Direto com a artesã" },
];

const careIcons = { hand: Hand, droplets: Droplets, sun: Sun, wind: Wind } as const;

export default async function Home() {
  const products = await getCatalogProducts();

  return (
    <>
      <PageViewTracker />

      {/* Aviso de topo */}
      <div className="bg-terracota px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        <Heart className="-mt-0.5 mr-1.5 inline size-3.5 fill-white/90" />
        Peças feitas à mão sob encomenda • Envio para todo o Brasil
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-amber-100/70 bg-creme/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
          <a href="#" aria-label="Ateliê da Suh — início">
            <Logo />
          </a>

          <ul className="hidden items-center gap-7 text-sm font-semibold text-cafe md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-terracota">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={greetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-whats px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-whats-escuro sm:px-5"
          >
            <MessageCircle className="size-4" />
            <span className="hidden sm:inline">Chamar no WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="bg-pontinhos absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white px-3.5 py-1.5 text-xs font-bold text-terracota-escuro shadow-sm">
                <Sparkles className="size-3.5" />
                Ateliê artesanal @{INSTAGRAM_HANDLE}
              </span>
              <h1 className="mt-5 font-serif text-4xl font-medium leading-[1.1] text-grafite sm:text-5xl lg:text-6xl">
                Transforme sua casa com o{" "}
                <em className="font-normal text-terracota">aconchego</em> do crochê feito à mão
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-cafe sm:text-lg">
                Mesa posta, tapetes, bolsas, cestos e amigurumis feitos ponto a ponto, nas
                cores que você escolher — com aquele carinho de presente feito por alguém
                especial.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#catalogo"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-terracota px-7 py-4 font-bold text-white shadow-md shadow-terracota/25 transition-all hover:-translate-y-0.5 hover:bg-terracota-escuro"
                >
                  Ver o Catálogo
                  <ArrowRight className="size-4" />
                </a>
                <a
                  href={greetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-white px-7 py-4 font-bold text-grafite shadow-sm transition-colors hover:border-whats hover:text-whats-escuro"
                >
                  <MessageCircle className="size-4 text-whats" />
                  Encomendar peça exclusiva
                </a>
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm text-cafe">
                <Coffee className="size-4 text-terracota" />
                Do cafezinho da manhã ao jantar de domingo.
              </p>
            </div>

            {/* Colagem de fotos */}
            <div className="relative mx-auto w-full max-w-md md:max-w-none">
              <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4">
                <div className="relative col-span-3 row-span-6 aspect-[3/4.4] overflow-hidden rounded-3xl border-4 border-white shadow-md">
                  <Image
                    src="/images/maos.jpg"
                    alt="Mãos crochetando uma manta de quadradinhos coloridos"
                    fill
                    priority
                    sizes="(min-width: 768px) 320px, 60vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl border-4 border-white shadow-md">
                  <Image
                    src="/images/centro-mesa.jpg"
                    alt="Centro de mesa de crochê rendado"
                    fill
                    sizes="(min-width: 768px) 220px, 40vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl border-4 border-white shadow-md">
                  <Image
                    src="/images/cesto.jpg"
                    alt="Cesto de crochê colorido"
                    fill
                    sizes="(min-width: 768px) 220px, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="animate-float absolute -bottom-5 -left-2 flex items-center gap-3 rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-md sm:-left-6">
                <span className="grid size-10 place-items-center rounded-full bg-rosa-claro">
                  <Heart className="size-5 fill-rosa text-rosa" />
                </span>
                <span className="text-sm leading-tight">
                  <strong className="block text-grafite">Cada peça é única</strong>
                  <span className="text-cafe">feita só pra você</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section aria-label="Diferenciais" className="border-y border-amber-100 bg-white">
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-amber-100/60 lg:grid-cols-4">
            {differentials.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col items-center gap-2 bg-white px-3 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rosa-claro text-terracota">
                  <Icon className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm text-grafite">{title}</strong>
                  <span className="text-xs text-cafe">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <Catalog products={products} />

        {/* Guia de Cuidados */}
        <section id="cuidados" className="bg-pontinhos border-y border-amber-100 bg-palha/40 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <header className="mx-auto max-w-2xl text-center">
              <p className="font-hand text-2xl text-terracota">pra durar a vida toda</p>
              <h2 className="mt-1 font-serif text-3xl font-medium text-grafite sm:text-4xl">
                Guia de Cuidados com o Crochê
              </h2>
              <p className="mt-4 text-cafe">
                Crochê bem cuidado atravessa gerações. Com esses carinhos simples, sua peça
                continua linda por muitos e muitos anos.
              </p>
            </header>

            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {careTips.map((tip, i) => {
                const Icon = careIcons[tip.icon];
                return (
                  <li
                    key={tip.title}
                    className="relative rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"
                  >
                    <span className="absolute right-5 top-4 font-serif text-4xl font-light text-palha">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="grid size-12 place-items-center rounded-2xl bg-rosa-claro text-terracota">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-5 font-serif text-lg font-medium text-grafite">{tip.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cafe">{tip.text}</p>
                  </li>
                );
              })}
            </ol>

            <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 text-center text-sm text-cafe">
              <ShieldCheck className="size-4 shrink-0 text-whats-escuro" />
              Toda encomenda vai com uma etiqueta de cuidados escrita pela Suh.
            </p>
          </div>
        </section>

        {/* Sobre a Artesã */}
        <section id="sobre" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm md:grid-cols-2">
              <div className="bg-pontinhos relative flex items-center justify-center bg-palha/50 px-8 py-12 md:py-16">
                <div className="relative w-full max-w-[19rem] sm:max-w-sm">
                  {/* anel tracejado lembrando os pontos do crochê */}
                  <div className="absolute -inset-3 rounded-full border-2 border-dashed border-rosa/60 sm:-inset-4" />
                  <div className="relative aspect-square overflow-hidden rounded-full border-[6px] border-white shadow-md">
                    <Image
                      src="/images/suh.jpg"
                      alt="Suh, a artesã, sorrindo em frente à prateleira de novelos do ateliê"
                      fill
                      sizes="(min-width: 640px) 384px, 304px"
                      className="object-cover"
                    />
                  </div>
                  <span className="animate-float absolute -bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-white px-4 py-2 text-sm font-bold text-grafite shadow-md sm:right-4">
                    <Heart className="size-4 fill-rosa text-rosa" />
                    Suh, a artesã
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <p className="font-hand text-2xl text-terracota">prazer, eu sou a Suh</p>
                <h2 className="mt-1 font-serif text-3xl font-medium text-grafite sm:text-4xl">
                  Sobre a Artesã
                </h2>
                <blockquote className="mt-6 border-l-4 border-rosa pl-5 font-serif text-xl italic leading-relaxed text-grafite">
                  “Cada ponto é feito à mão com carinho e dedicação para deixar sua casa mais
                  bonita.”
                </blockquote>
                <p className="mt-6 leading-relaxed text-cafe">
                  O crochê chegou na minha vida pelas mãos da família e virou o meu jeito de
                  cuidar das pessoas. No meu ateliê, cada peça é pensada com você: a cor, o
                  tamanho, o cantinho onde ela vai morar. Depois, vai embrulhada com cheirinho
                  e um bilhete escrito à mão.
                </p>
                <ul className="mt-6 grid gap-2 text-sm text-grafite sm:grid-cols-2">
                  {["Fios de algodão de qualidade", "Acabamento caprichado", "Embalagem perfumada", "Envio para todo o Brasil"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Heart className="size-3.5 fill-rosa text-rosa" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
                <p className="mt-8 font-hand text-3xl text-terracota">com amor, Suh</p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section id="depoimentos" className="pb-20 sm:pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <header className="mx-auto max-w-2xl text-center">
              <p className="font-hand text-2xl text-terracota">carinho que volta</p>
              <h2 className="mt-1 font-serif text-3xl font-medium text-grafite sm:text-4xl">
                O que as clientes dizem
              </h2>
            </header>
            <ul className="mt-12 grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <li
                  key={t.name}
                  className="flex flex-col rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5" aria-label="5 de 5 estrelas">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="size-7 text-rosa-claro" />
                  </div>
                  <p className="mt-4 flex-1 leading-relaxed text-grafite">“{t.text}”</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-amber-100 pt-4">
                    <span className="grid size-10 place-items-center rounded-full bg-rosa-claro font-serif font-semibold text-terracota-escuro">
                      {t.name[0]}
                    </span>
                    <span className="text-sm leading-tight">
                      <strong className="block text-grafite">{t.name}</strong>
                      <span className="text-cafe">
                        {t.city} · {t.product}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-4 pb-20 sm:px-6 sm:pb-24">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-terracota px-6 py-12 text-center text-white shadow-md sm:px-12">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgb(255_255_255/0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative">
              <Sparkles className="mx-auto size-7" />
              <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
                Tem uma ideia de peça especial?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/90">
                Conta pra Suh! Ela cria sob medida, nas cores e tamanhos que você imaginar.
              </p>
              <a
                href={greetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 font-bold text-terracota-escuro shadow-md transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="size-5 text-whats" />
                Conversar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <Logo layout="stacked" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cafe">
              Crochê artesanal feito à mão com amor para deixar sua casa mais bonita e
              aconchegante.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-grafite">Navegue</h3>
            <ul className="mt-4 space-y-2 text-sm text-cafe">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-terracota">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-grafite">Fale com a Suh</h3>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-sm text-cafe hover:text-terracota"
              >
                <span className="grid size-10 place-items-center rounded-full bg-gradient-to-tr from-amber-400 via-rosa to-terracota text-white">
                  <InstagramIcon className="size-5" />
                </span>
                <span>
                  <strong className="block text-grafite group-hover:text-terracota">@{INSTAGRAM_HANDLE}</strong>
                  Acompanhe as novidades do ateliê
                </span>
              </a>
              <a
                href={greetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-sm text-cafe hover:text-whats-escuro"
              >
                <span className="grid size-10 place-items-center rounded-full bg-whats text-white">
                  <MessageCircle className="size-5" />
                </span>
                <span>
                  <strong className="block text-grafite group-hover:text-whats-escuro">WhatsApp</strong>
                  Pedidos e orçamentos
                </span>
              </a>
              <p className="inline-flex items-center gap-2 text-sm text-cafe">
                <Truck className="size-4 text-terracota" />
                Envio para todo o Brasil
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-amber-100 px-4 py-5 text-center text-xs text-cafe">
          © Crochês da Suh · Feito à mão com{" "}
          <Heart className="-mt-0.5 inline size-3 fill-rosa text-rosa" /> no Brasil
        </div>
      </footer>

      {/* Botão flutuante de WhatsApp (mobile) */}
      <a
        href={greetingUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-whats text-white shadow-lg shadow-whats/40 transition-transform hover:scale-105 md:hidden"
      >
        <MessageCircle className="size-6" />
      </a>
    </>
  );
}
