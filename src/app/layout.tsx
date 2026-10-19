import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Nunito_Sans, Sacramento } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: "400",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crochês da Suh | Crochê artesanal feito à mão com amor",
  description:
    "Jogos americanos, sousplats, tapetes, bolsas, cestos e amigurumis de crochê feitos à mão sob encomenda. Escolha suas cores e peça direto pelo WhatsApp. Envio para todo o Brasil.",
  openGraph: {
    title: "Crochês da Suh",
    description: "Transforme sua casa com o aconchego do crochê feito à mão.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${nunito.variable} ${caveat.variable} ${sacramento.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
