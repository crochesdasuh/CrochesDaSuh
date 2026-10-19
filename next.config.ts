import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : undefined;

const nextConfig: NextConfig = {
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
