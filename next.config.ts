import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Necesario para procesar imágenes/colas/IA en el servidor sin bundlear nativos.
  serverExternalPackages: ["sharp", "bullmq", "ioredis", "@google-cloud/vision"],
  images: {
    // Configurar aquí el dominio del storage cuando se sirva por CDN.
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
