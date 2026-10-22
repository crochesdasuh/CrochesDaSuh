import { buildOrderMessage, colorPalettes } from "@/data/crochets";
import { getCatalogProducts } from "@/lib/products";
import { whatsappNumber, whatsappUrl } from "@/lib/whatsapp";

const GREETING = "Olá Dona Suh! Vim pelo site e queria conversar sobre uma peça de crochê. 🧶";

const PRIVATE = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};

/**
 * Abre a conversa no WhatsApp. O número fica só no servidor: a página aponta
 * para /whatsapp?peca=…&cor=…&qtd=… e esta rota monta a mensagem e redireciona.
 * Assim robôs que varrem o HTML atrás de telefones não encontram o número.
 */
export async function GET(request: Request) {
  const number = whatsappNumber();
  if (!number) {
    console.error("WHATSAPP_NUMBER não configurado.");
    return new Response("WhatsApp indisponível no momento.", { status: 503, headers: PRIVATE });
  }

  const params = new URL(request.url).searchParams;
  let message = GREETING;

  const productId = params.get("peca");
  if (productId) {
    const product = (await getCatalogProducts()).find((p) => p.id === productId);
    if (product) {
      const palette = colorPalettes.find((c) => c.id === params.get("cor")) ?? colorPalettes[0];
      const qty = Number(params.get("qtd"));
      const quantity = product.quantity.options.includes(qty) ? qty : product.quantity.options[0];
      message = buildOrderMessage(product, palette, quantity);
    }
  }

  return new Response(null, { status: 302, headers: { ...PRIVATE, Location: whatsappUrl(number, message) } });
}
