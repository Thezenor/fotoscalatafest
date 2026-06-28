import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// CSP: 'unsafe-inline' en script/style es necesario para Next sin nonce.
// Bloquea scripts externos, object, base-uri y enmarcado de terceros.
// Los pagos (Stripe/PayPal) son redirecciones de nivel superior, no iframes,
// así que no requieren excepciones de frame/connect.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // La subida usa la cámara del móvil; el resto de permisos, denegados.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Necesario para procesar imágenes/colas/IA en el servidor sin bundlear nativos.
  serverExternalPackages: ["sharp", "bullmq", "ioredis", "@google-cloud/vision"],
  images: {
    // Configurar aquí el dominio del storage cuando se sirva por CDN.
    remotePatterns: [],
    // Sirve AVIF/WebP (mucho más ligeros) y cachea los derivados un año:
    // clave para la red saturada del recinto.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1280, 1920],
    imageSizes: [96, 160, 240, 320, 480],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
