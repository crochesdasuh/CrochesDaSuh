import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : undefined;

const isDev = process.env.NODE_ENV === "development";
const supabaseOrigin = supabaseUrl?.origin ?? "";

// Política de conteúdo: a página só carrega e só envia dados para o próprio
// site, o Supabase (fotos e envio de arquivos) e o YouTube (vídeos das receitas).
// Sem nonce porque o site usa pré-renderização parcial (ver docs do Next).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${supabaseOrigin} https://i.ytimg.com`,
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin}`,
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // No `next dev` pela rede (http://192.168…) isso quebraria as requisições.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Painel: nunca fica guardado em cache (nem no navegador, nem no "voltar"),
        // não vaza o endereço para outros sites e não aparece no Google.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  // Permite testar o `next dev` pelo celular na rede local (IP desta máquina).
  allowedDevOrigins: ["192.168.0.10"],
  cacheComponents: true,
  images: {
    // Fotos enviadas pelo /admin ficam no Storage do Supabase.
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol === "http:" ? "http" : "https",
            hostname: supabaseUrl.hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
