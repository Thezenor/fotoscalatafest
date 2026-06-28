# 📸 Handoff — CALATAFEST FOTOS

> Plataforma de fotos de festival. Los asistentes escanean un QR, eligen escenario,
> suben sus fotos, aceptan los términos y ven las fotos aprobadas en galerías,
> carruseles y pantallas live. Dominio previsto: **fotoscalatafest.com**.

---

## 0. Cómo usar este paquete (léeme primero)

Este paquete está pensado para dárselo a **Claude Code** o **Antigravity** y que reconstruyan
el producto **exactamente** con la estética de Calatafest.

### Qué son los archivos de este bundle
Los archivos `.dc.html`, `.svg` y `/photos` son **referencias de diseño hechas en HTML**:
prototipos que muestran el aspecto y el comportamiento deseados, **no** código de producción
para copiar tal cual. La tarea es **recrear estos diseños en el stack objetivo**
(**Next.js + Tailwind CSS**, según pidió el cliente) usando componentes y patrones propios.

### Fidelidad
**Alta fidelidad (hi-fi).** Colores, tipografías, espaciados, radios y micro-interacciones
son finales. Reprodúcelos **píxel a píxel** con los tokens de `01-DESIGN-SYSTEM.md`.

### Orden de lectura recomendado
1. `01-DESIGN-SYSTEM.md` — tokens: color, tipografía, espaciado, radios, sombras.
2. `02-SCREENS.md` — las 8 pantallas, layout exacto y **todos los textos**.
3. `03-COMPONENTS.md` — catálogo de componentes UI reutilizables.
4. `04-INTERACTIONS.md` — animaciones, estados, navegación, datos/estado.
5. `05-TECH-STACK.md` — `tailwind.config`, fuentes, estructura Next.js, modelo de datos.
6. `06-BUILD-PROMPT.md` — **prompt listo para pegar** en Claude Code / Antigravity.
7. `07-I18N-LEGAL.md` — claves de traducción y textos legales.

### Capturas
En `/screenshots` hay una imagen por pantalla (`01-landing.png` … `08-admin-desktop.png`)
y una vista general (`overview.png`). Úsalas como referencia visual exacta.

### Archivo de diseño vivo
`Calatafest Fotos.dc.html` se abre en cualquier navegador y contiene **las 9 frames**
(7 móvil + 2 escritorio) en un lienzo. Es la fuente de verdad visual.

---

## 1. Resumen del producto

| | |
|---|---|
| **Nombre** | CALATAFEST FOTOS |
| **Dominio** | fotoscalatafest.com |
| **Stack objetivo** | Next.js (App Router) + Tailwind CSS |
| **Enfoque** | Mobile-first, rapidísimo de usar en el recinto, alto contraste |
| **Modo** | Oscuro permanente (fondo negro, la foto aporta el color) |
| **Acento único** | Amarillo Calatafest `#F9B41A` (CTA, foco, badges activos) |
| **Idiomas** | Multiidioma (ES base; preparar EN/CA) |

## 2. Las 8 pantallas
1. **Landing QR** — entrada tras escanear el QR.
2. **Selector de escenario/sección** — tarjetas-banner grandes.
3. **Subida de foto** — cámara/galería, datos opcionales, legales.
4. **Confirmación** — mensaje emocional + estado de revisión.
5. **Galería pública** — carrusel destacado + grid masonry + filtros.
6. **Foto individual** — foto protagonista + QR + compartir + retirada.
7. **Pantalla Live (16:9)** — para las pantallas del recinto (3 variantes).
8. **Panel admin** — dashboard + moderación (escritorio + vista móvil moderador).

## 3. Identidad heredada de calatafest.es
- **Color de marca:** amarillo dorado `#F9B41A` + negro + blanco. (Confirmado del header
  y del botón "¡COMPRA TUS ENTRADAS!" de la web oficial.)
- **Logo:** mascota de auriculares 8-bit monocroma + wordmark "CALATAFEST" redondeado.
  > ⚠️ El SVG incluido (`mascot-white.svg` / `mascot-dark.svg`) es un **placeholder fiel**.
  > **Sustituir por el logo oficial** (PNG/SVG en blanco y negro) antes de producción.
- **Tipografía:** display redondeada/arcade (ver `01-DESIGN-SYSTEM.md`).
- **Tono:** nocturno, eufórico, "buen rollo", muy fotográfico, mayúsculas potentes.

## 4. Assets
- `mascot-white.svg`, `mascot-dark.svg` — logo placeholder (sustituir por el oficial).
- `/photos/p01.png … p17.png` — fotos de demo (festival/concierto, libres CORS).
  En producción provienen de las **subidas reales** de los asistentes.
- Logos de patrocinadores (Heraldo, Coca-Cola, Beefeater, Ibercaja, Ámbar, Bono Cultural):
  **pendientes** — en el diseño aparecen como texto; pedir los SVG oficiales.

## 5. Archivos del paquete
```
design_handoff_calatafest_fotos/
├── README.md                  ← este archivo
├── 01-DESIGN-SYSTEM.md        ← tokens y sistema visual
├── 02-SCREENS.md              ← 8 pantallas + copys exactos
├── 03-COMPONENTS.md           ← catálogo de componentes
├── 04-INTERACTIONS.md         ← animaciones, estados, navegación
├── 05-TECH-STACK.md           ← tailwind.config + Next.js + datos
├── 06-BUILD-PROMPT.md         ← prompt para Claude Code / Antigravity
├── 07-I18N-LEGAL.md           ← i18n + textos legales
├── design/
│   ├── Calatafest Fotos.dc.html   ← diseño vivo (9 frames)
│   ├── mascot-white.svg
│   └── mascot-dark.svg
├── photos/                    ← p01.png … p17.png
└── screenshots/               ← una imagen por pantalla
```
