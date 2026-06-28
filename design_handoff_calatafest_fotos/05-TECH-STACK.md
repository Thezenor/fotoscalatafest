# 05 · Stack técnico — Next.js + Tailwind

Guía para que el dev configure el proyecto de forma que los tokens del diseño queden
disponibles como utilidades de Tailwind. **No** copies el HTML de los prototipos; recrea
los componentes con estas utilidades.

---

## 1. `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#F9B41A", ink: "#0E0E0E" },
        ink: { DEFAULT: "#0E0E0E", pure: "#0A0A0A" },
        surface: { DEFAULT: "#161616", 2: "#1F1F1F" },
        line: "#2B2B2B",
        mist: { DEFAULT: "#A8A8A8", 2: "#777777" },
        success: { DEFAULT: "#22C55E", ink: "#06210F" },
        danger: "#EF4444",
      },
      fontFamily: {
        display: ["var(--font-fredoka)", "system-ui", "sans-serif"], // titulares, botones
        body: ["var(--font-hanken)", "system-ui", "sans-serif"],     // cuerpo, forms
        mono: ["var(--font-chakra)", "ui-monospace", "monospace"],   // badges, eyebrows
      },
      borderRadius: {
        pill: "999px", xl: "24px", lg: "20px", md: "18px", sm: "14px", xs: "11px",
      },
      boxShadow: {
        card: "0 30px 70px rgba(0,0,0,.45)",
        glow: "0 0 0 12px rgba(249,180,26,.12)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        kenburns: { from: { transform: "scale(1.02)" }, to: { transform: "scale(1.14)" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".4" } },
        pop: { "0%": { transform: "scale(.5)", opacity: "0" }, "65%": { transform: "scale(1.12)" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        marquee: "marquee 16s linear infinite",
        kenburns: "kenburns 7s ease-in-out infinite alternate",
        pulseSoft: "pulseSoft 1.4s ease-in-out infinite",
        pop: "pop .5s ease both",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

> Por defecto la app es oscura: pon `bg-ink text-white` en `<body>`.

---

## 2. Fuentes (`app/layout.tsx`)

```ts
import { Fredoka, Hanken_Grotesk, Chakra_Petch } from "next/font/google";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-fredoka" });
const hanken  = Hanken_Grotesk({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-hanken" });
const chakra  = Chakra_Petch({ subsets: ["latin"], weight: ["500","600","700"], variable: "--font-chakra" });

// <html className={`${fredoka.variable} ${hanken.variable} ${chakra.variable}`}>
//   <body className="bg-ink text-white font-body antialiased">
```

Uso: `font-display` (Fredoka), `font-body` (Hanken), `font-mono` (Chakra Petch).

---

## 3. Estructura de carpetas (App Router)

```
app/
├── layout.tsx                 # fuentes, <body> oscuro, i18n provider
├── page.tsx                   # 01 Landing QR
├── escenarios/page.tsx        # 02 Selector
├── subir/[stage]/page.tsx     # 03 Subida (escenario en la ruta)
├── enviada/page.tsx           # 04 Confirmación
├── galeria/page.tsx           # 05 Galería pública
├── foto/[id]/page.tsx         # 06 Foto individual
├── live/page.tsx              # 07 Pantalla Live (?variant=destacadas|carrusel|mosaico)
├── admin/
│   ├── layout.tsx             # sidebar
│   ├── page.tsx               # dashboard
│   └── moderacion/page.tsx    # cola de moderación
└── api/
    ├── photos/route.ts        # GET (lista) / POST (subida)
    ├── photos/[id]/route.ts   # GET / PATCH
    ├── stages/route.ts
    ├── live/route.ts          # SSE o polling
    └── admin/photos/route.ts
components/
  ui/        (Button, Badge, Eyebrow, Input, LegalCheckbox, SegmentedTabs, IconButton)
  content/   (StageCard, PhotoCard, FeaturedCarousel, FilterChips, Uploader, QRBlock,
              WatermarkLogo, SponsorStrip, Marquee)
  live/      (LiveStage, LiveTopBar, LiveFooter, LiveFeatured, LiveCarousel, LiveMosaic)
  admin/     (Sidebar, StatCard, ModerationCard, StatusBadge, ActionBar)
lib/         (api client, qr helpers, i18n)
public/
  brand/     (logo oficial cuando llegue), sponsors/
```

---

## 4. Modelo de datos (sugerido)

```ts
type Stage = {
  id: string; name: string; sub: string; day: string; // "VIE" | "SÁB" | "VIE · SÁB"
  image: string; order: number;
};

type Photo = {
  id: string;
  url: string;            // original / alta calidad
  thumbUrl: string;       // versión optimizada
  width: number; height: number;
  stageId: string; stageName: string; day: "VIE" | "SÁB"; time?: string;
  author?: { name?: string; instagram?: string; tiktok?: string };
  comment?: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;      // ★ destacada
  onScreen: boolean;      // enviada a pantalla Live
  createdAt: string;
};
```

---

## 5. Dependencias recomendadas
- `qrcode.react` — generación de QR (foto individual y Live).
- `framer-motion` — transiciones de ruta, cross-fade Live, FLIP de filtros.
- `lucide-react` — iconos (sustituir los emojis de los prototipos).
- `next/image` — optimización + blur placeholder (clave para "carga rápida").
- i18n: `next-intl` (recomendado para App Router) — ver `07-I18N-LEGAL.md`.
- Subida/almacenamiento: a definir (S3/Cloudinary/UploadThing). Generar thumbnails al subir.

---

## 6. Rendimiento (requisito de festival)
- `next/image` con `sizes` correctos; servir AVIF/WebP; thumbnails para grid y Live.
- Lazy-load del grid; prefetch del carrusel destacado.
- Live: precargar la siguiente foto antes del cross-fade.
- Cache de la galería pública (ISR/revalidate corto) + invalidación al aprobar.
