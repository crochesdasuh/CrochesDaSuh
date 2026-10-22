import "server-only";

/**
 * Número do WhatsApp da Suh. Vem da variável de ambiente WHATSAPP_NUMBER
 * (sem o prefixo NEXT_PUBLIC_), então nunca vai para o navegador nem para o
 * GitHub: só a rota /whatsapp lê e redireciona para a conversa.
 */
export function whatsappNumber() {
  const digits = (process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return digits.length >= 12 && digits.length <= 13 ? digits : null;
}

export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
