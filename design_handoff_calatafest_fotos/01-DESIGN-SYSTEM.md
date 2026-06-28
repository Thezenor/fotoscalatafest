# 01 · Sistema de diseño — CALATAFEST FOTOS

Reproduce estos valores **exactamente**. Es hi-fi.

---

## 1. Color

Modo oscuro permanente. **Regla de oro:** fondo negro + foto + **un solo** acento amarillo.
El amarillo se reserva para acción (CTA, foco, estado activo, destacado). El color "de fiesta"
lo aportan las fotografías, no la UI.

| Token | Hex | Uso |
|---|---|---|
| `brand` | `#F9B41A` | Acento único: CTA, foco, badges activos, marquee, destacadas |
| `brand-ink` | `#0E0E0E` | Texto **sobre** amarillo (botones) |
| `ink` | `#0E0E0E` | Fondo base de la app |
| `ink-pure` | `#0A0A0A` | Fondo pantalla Live |
| `surface` | `#161616` | Tarjetas, paneles |
| `surface-2` | `#1F1F1F` | Inputs, chips, botones secundarios, elevación |
| `line` | `#2B2B2B` | Bordes sutiles, separadores |
| `white` | `#FFFFFF` | Texto principal |
| `mist` | `#A8A8A8` | Texto secundario / metadatos |
| `mist-2` | `#777777` | Texto terciario / etiquetas tenues |

**Semánticos (admin / estados de moderación):**

| Token | Hex | Uso |
|---|---|---|
| `success` | `#22C55E` | Aprobada / aprobar |
| `success-ink` | `#06210F` | Texto sobre verde |
| `danger` | `#EF4444` | Rechazada / rechazar |
| `pending` | `#F9B41A` | Pendiente (usa el amarillo de marca) |
| `featured` | `#F9B41A` | Destacada |

**Degradados / overlays usados:**
- Overlay legibilidad sobre foto (vertical):
  `linear-gradient(180deg, transparent 40%, rgba(14,14,14,.92))`
- Overlay banner horizontal:
  `linear-gradient(90deg, rgba(14,14,14,.85), rgba(14,14,14,.1))`
- Glow de confirmación:
  `radial-gradient(120% 80% at 50% 30%, rgba(249,180,26,.14), transparent 60%)`
- Translúcidos de marca para fondos suaves: `rgba(249,180,26,.12)` / `.14`.

---

## 2. Tipografía

Tres familias de Google Fonts. Cárgalas con `next/font/google`.

| Rol | Familia | Pesos | Uso |
|---|---|---|---|
| **Display / UI redonda** | `Fredoka` | 400/500/600/700 | Titulares, botones, nombres de escenario, números clave |
| **Cuerpo / formularios** | `Hanken Grotesk` | 400/500/600/700/800 | Párrafos, labels, inputs, texto largo |
| **Etiquetas técnicas** | `Chakra Petch` | 500/600/700 | Badges, eyebrows, día/hora, status bar, "credencial" |

> **Por qué:** Fredoka replica los terminales redondos y la energía arcade del wordmark
> oficial; Hanken aporta limpieza mobile-first; Chakra Petch da el toque techno de festival.
> El wordmark "CALATAFEST" es **logotipo propio** (usar el asset, no recrearlo con fuente).

### Escala tipográfica (px reales del diseño)

| Elemento | Familia | Tamaño | Peso | Line-height | Tracking | Caja |
|---|---|---|---|---|---|---|
| H1 hero móvil | Fredoka | 46 | 700 | .92 | -.01em | UPPER |
| H1 confirmación | Fredoka | 40 | 700 | .95 | normal | UPPER |
| H2 sección móvil | Fredoka | 22 | 700 | 1 | normal | UPPER |
| Título escenario (card) | Fredoka | 25 | 700 | 1 | normal | Title |
| Título Live (foto) | Fredoka | 38 | 700 | 1 | normal | Title |
| Título admin | Fredoka | 26 | 700 | 1 | normal | Title |
| Número stat | Fredoka | 34 | 700 | 1 | normal | — |
| Botón | Fredoka | 16–18 | 700 | 1 | normal | UPPER/Title |
| Eyebrow / overline | Chakra Petch | 11–13 | 600 | 1 | .16–.28em | UPPER |
| Badge | Chakra Petch | 10–12 | 700 | 1 | .06–.14em | UPPER |
| Cuerpo | Hanken Grotesk | 15–16 | 400/500 | 1.45–1.5 | normal | — |
| Texto secundario | Hanken Grotesk | 13–14 | 400 | 1.4 | normal | — |
| Input | Hanken Grotesk | 15 | 400 | — | normal | — |

---

## 3. Espaciado

Escala base **4px**. Valores más usados: `4, 8, 10, 12, 14, 18, 22, 24, 26, 30`.
- Padding lateral pantalla móvil: **18–22px**.
- Gap entre tarjetas (listas): **12–14px**.
- Gap grid masonry: **10px**.
- Gap grid admin escritorio: **16px**.
- Padding interior de tarjeta: **16–18px**.
- Padding panel admin (main): **24–30px**.

## 4. Radios de borde

| Token | Valor | Uso |
|---|---|---|
| `pill` | `999px` | Botones, chips, badges |
| `xl` | `24px` | Tarjetas grandes / banners selector |
| `lg` | `20px` | Tarjetas, foto protagonista, modales |
| `md` | `18px` | Banners pequeños, dropzone, bloque QR |
| `sm` | `14px` | Inputs, tabs, fotos de grid, botones de acción |
| `xs` | `10–12px` | Botones de acción admin, mini-thumbs |
| Marco móvil (mockup) | `38–46px` | Solo para el mockup de dispositivo, no la app real |

## 5. Sombras

- Tarjeta elevada / dispositivo: `0 30px 70px rgba(0,0,0,.45)`.
- Glow de botón amarillo (estado destacado): `0 0 0 12px rgba(249,180,26,.12)`.
- En general la app usa **bordes** (`1px #2B2B2B`) más que sombras; las sombras se reservan
  para overlays/modales y la pantalla Live.

## 6. Iconografía

- Estilo: line icons simples, monocromos (blanco / amarillo).
- Tamaño táctil mínimo **44px**; botones circulares de 40–56px.
- Recomendado: **Lucide** (`lucide-react`) por su trazo redondeado coherente con Fredoka.
- En los prototipos se usan emojis (📸 ↗ ⤓ ✓ ✕ ★ 📺 🔍) como **placeholder** —
  sustituir por iconos Lucide equivalentes (Camera, Share2, Download, Check, X, Star,
  MonitorPlay, Search, ArrowLeft).

## 7. Reglas duras (no negociables)
1. Fondo negro siempre; la foto es la protagonista.
2. **Un solo acento** por vista. Nada de mezclar amarillo con otros colores de UI.
3. Titulares **solo en Fredoka**.
4. Hit target **≥56px** en CTA principal; **≥44px** en cualquier elemento táctil.
5. Toda foto con texto encima lleva **overlay degradado** antes del texto.
6. Logo y patrocinadores en **monocromo** (blanco sobre negro).
7. Respetar `prefers-reduced-motion`.
8. Imágenes optimizadas (`next/image`, AVIF/WebP, lazy + blur placeholder).
