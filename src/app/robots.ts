import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Painel, rota do WhatsApp (onde fica o número) e APIs não devem ser indexados.
      disallow: ["/admin", "/whatsapp", "/api/"],
    },
  };
}
