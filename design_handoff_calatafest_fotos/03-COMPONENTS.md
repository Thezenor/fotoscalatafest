# 03 · Catálogo de componentes UI

Componentes reutilizables a construir en React (Next.js). Para cada uno: props sugeridas,
estilos clave y estados. Todos heredan los tokens de `01-DESIGN-SYSTEM.md`.

---

## Primitivos

### `Button`
- Variantes: `primary` (pill, `bg brand`, texto `brand-ink`, Fredoka 700), `secondary`
  (pill, borde `rgba(255,255,255,.6)`, `bg rgba(255,255,255,.06)`, blur), `ghostIcon`
  (círculo 40–56px, `bg surface-2`), `danger`/`success` (admin).
- Alturas: `lg` 58px (CTA principal), `md` 54px, `sm` 38–46px (admin/tabs).
- Estados: hover `brightness(1.08) scale(1.02)`; active `scale(.98)`; disabled `opacity .45`.
- Hit target ≥56px en CTA principal.

### `Badge`
- Pill, [Chakra Petch 700/10–12px], UPPER, tracking .06–.14em.
- Tonos: `brand` (amarillo/negro), `success`, `danger`, `neutral` (borde `line`).
- Ej.: `★ DESTACADA`, `VIE`, `24 EN COLA`, `EN PANTALLA`.

### `Eyebrow` (overline)
- [Chakra Petch 600/11–13px], UPPER, tracking .16–.28em, color `brand` o `mist-2`.

### `IconButton`
- Círculo 40px (`bg surface-2`) o 48–56px; icono Lucide centrado.

---

## Formularios

### `Input` / `Textarea`
- Alto 50px (input) / 62px (textarea), `bg surface-2`, borde `line`, radio 13–14px,
  padding 0 16px, texto blanco [Hanken 15px], placeholder `mist`.
- Focus: borde `brand` + ring `rgba(249,180,26,.30)`.

### `LegalCheckbox`
- Caja 22px, radio 6px. Sin marcar: borde `1.5px #555`. Marcada: `bg brand`, `✓` `brand-ink` 800.
- Área táctil ≥44px. Label [Hanken 13px `#C8C8C8` lh 1.35] con enlaces a legales.

### `SegmentedTabs`
- Contenedor `bg surface-2` radio 14px padding 4px. Pestaña activa `bg brand` texto `brand-ink`;
  inactiva texto `mist`. Usado en Subida (Cámara/Galería).

---

## Contenido

### `StageCard` (banner de escenario)
- Alto 158px (selector) / 96px (teaser landing), radio 22/18px, foto a sangre + overlay.
- Slots: `badgeDay` (arriba-der), `sub`, `name` (Fredoka 700), `cta` (pill amarillo, opcional).
- Props: `image, name, sub, day, href`.

### `PhotoCard` (item de galería)
- Foto radio 14px, overlay inferior, etiqueta `{stage} · {day}`, acciones (share/download) on tap.
- En masonry: `width:100%; height:auto` dentro de contenedor `column-count`.
- Props: `image, stage, day, onShare, onDownload, href`.

### `FeaturedCarousel`
- Alto 200px, foto + overlay + badge destacada + pie + dots. Auto-avance opcional + scroll-snap.
- Props: `slides[]`, `autoPlay`, `interval`.

### `FilterChips`
- Fila scroll-snap horizontal de chips. Activo `bg brand`. Sticky bajo header.
- Props: `options[]`, `value`, `onChange`.

### `Uploader`
- Tabs Cámara/Galería + dropzone/preview. Cámara → `<input capture="environment">`;
  Galería → `<input type="file" accept="image/*">`. Muestra preview + nombre archivo + botón quitar.
- Props: `onSelect(file)`, `previewUrl`.

### `QRBlock`
- Cuadrado blanco con el QR (usar lib `qrcode.react`), + título + descripción.
- Tamaños: 78px (foto individual), 118px (Live). Props: `value`, `size`, `title`, `caption`.

### `WatermarkLogo`
- Mascota + `CALATAFEST` semitransparente (.85), esquina inferior derecha de la foto.

### `SponsorStrip`
- Fila de logos monocromos con overline. Props: `sponsors[]`, `align`.
- ⚠️ Pedir SVG oficiales; placeholder de texto por ahora.

### `Marquee`
- Cinta amarilla con texto en bucle infinito (CSS `@keyframes` translateX -50%, contenido duplicado).
- Props: `text`, `speed`. Respeta `prefers-reduced-motion`.

---

## Pantalla Live

### `LiveStage`
- Contenedor 16:9 fijo, sin chrome. Sub-componentes: `LiveTopBar`, `LiveFooter`, y el cuerpo
  según `variant`: `LiveFeatured` (1 grande + 3 thumbs + QR), `LiveCarousel` (1 a pantalla),
  `LiveMosaic` (rejilla 6–9 + QR). Auto-rotación por `interval`.

---

## Admin

### `StatCard`
- `bg surface` borde `line` radio 16px. Label [12px `mist`] + número [Fredoka 700/34px] (color
  según métrica). Props: `label, value, tone`.

### `ModerationCard`
- Foto (150px) + `StatusBadge` + nombre/escenario/tiempo + `ActionBar`.
- Props: `photo, name, stage, time, status, onApprove, onReject, onFeature, onSendToScreen`.

### `StatusBadge`
- pendiente (amarillo) · aprobada (verde) · rechazada (rojo) · destacada (amarillo con ★).

### `ActionBar`
- Fila de 4 botones: aprobar (verde), rechazar (rojo), destacar (amarillo outline), a pantalla (amarillo).

### `Sidebar` (admin)
- 230px, logo + nav con item activo amarillo + badge de conteo en Moderación + footer usuario.

---

## Navegación / layout

### `AppHeader` (móvil)
- 64px, translúcido (`backdrop-blur`), logo izq + idioma/menú der. Sticky.

### `LangSwitcher`
- Pill `ES ▾` → dropdown ES / EN / CA.

### `StickyCTA`
- Barra inferior fija con CTA principal (Subida). Degradado de fondo para despegue del contenido.

### `DeviceFrame` *(solo mockup)*
- El marco negro redondeado de los prototipos **no** se implementa en la app real.
