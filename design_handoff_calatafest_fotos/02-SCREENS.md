# 02 · Pantallas — layout y copys exactos

Para cada pantalla: propósito, layout, componentes (con tamaños/colores/tipografía) y
**el texto literal** a usar. Las medidas son las del mockup móvil de **368px de ancho**
(escala a tu breakpoint; las proporciones mandan). Captura de referencia en `/screenshots`.

Convención: `[Fredoka 700 / 46px]` = familia / peso / tamaño.

---

## 01 · Landing QR  →  `screenshots/01-landing.png`

**Propósito:** primera pantalla tras escanear el QR. Enganchar y llevar a subir/ver fotos.

**Layout (scroll vertical):**
1. **Status bar** simulada (en producción no existe).
2. **Hero** (alto ~556px, `position:relative`, foto a sangre + overlay vertical):
   - **Top bar**: logo (mascota 30px + `CALATAFEST` [Fredoka 700/18px]) a la izq;
     selector idioma `ES ▾` a la der (pill, borde `rgba(255,255,255,.35)`, [Chakra Petch 600/12px]).
   - **Marquee** amarillo (`bg #F9B41A`, texto `#0E0E0E` [Chakra Petch 700/12px]), bucle infinito:
     `CALATAFEST FOTOS · 3—4 JULIO 2026 · SUBE TUS FOTOS DEL FESTIVAL ·`
   - **Copy hero** (abajo, padding 22px):
     - Eyebrow [Chakra Petch 600/12px, `#F9B41A`, tracking .22em]: `REVIVE EL FESTIVAL`
     - H1 [Fredoka 700/46px, blanco, lh .92]: `TUS FOTOS DEL CALATAFEST`
     - Párrafo [Hanken 400/15px, `#D8D8D8`]: `Escanea, sube tu foto y revive la noche. Las mejores se proyectan en las pantallas del recinto.`
     - **CTA primario** (pill, `bg #F9B41A`, texto `#0E0E0E` [Fredoka 700/18px], alto 58px): `📸 SUBIR MI FOTO`
     - **CTA secundario** (pill, borde blanco .6, `bg rgba(255,255,255,.06)`, blur, alto 54px): `VER GALERÍA`
3. **Sección "ELIGE TU ESCENARIO"** (padding 24/22px):
   - H2 [Fredoka 700/22px]: `ELIGE TU ESCENARIO` + enlace `Ver todos →` [`#F9B41A` 13px]
   - 2 banners (alto 96px, radio 18px, foto + overlay 90deg): `Escenario Principal` /
     `HEADLINERS · VIE+SÁB`  y  `Carpa Electrónica` / `DJ SETS · SÁBADO`
4. **Patrocinadores** (border-top `#1F1F1F`, padding 22px):
   - Overline centrada [Chakra Petch 10px, `#777`, tracking .28em]: `CON EL APOYO DE`
   - Fila de logos (placeholder texto, opacidad .75): `Heraldo · Coca-Cola · Beefeater · Ibercaja · Ámbar · Bono Cultural`

---

## 02 · Selector de escenario  →  `screenshots/02-selector.png`

**Propósito:** el asistente elige dónde está para asociar su foto a un escenario.

**Layout:**
- **Header**: botón atrás `←` (círculo 40px `#1F1F1F`) + título [Fredoka 700/22px]
  `ELIGE ESCENARIO` + subtítulo [Hanken 13px `#A8A8A8`] `¿Dónde estás ahora mismo?`
- **Lista vertical** (gap 14px) de **StageCards** (alto 158px, radio 22px, borde `#2B2B2B`):
  cada una = foto a sangre + overlay vertical + badge día (arriba-der, pill amarillo
  [Chakra Petch 700/11px]) + bloque inferior:
  - sub [Chakra Petch 11px `#F9B41A` tracking .16em]
  - nombre [Fredoka 700/25px]
  - chip CTA (pill amarillo [Fredoka 700/15px]): `📸 SUBIR FOTO AQUÍ →`

**Datos de las 4 tarjetas:**
| Nombre | Sub | Badge día |
|---|---|---|
| Escenario Principal | HEADLINERS | VIE · SÁB |
| Escenario Ámbar | INDIE & POP | VIERNES |
| Carpa Electrónica | DJ SETS · LATE NIGHT | SÁBADO |
| Escenario Local | BANDAS DE CALATAYUD | VIERNES |

---

## 03 · Subida de foto  →  `screenshots/03-upload.png`

**Propósito:** subir la foto rápido, con datos opcionales y aceptación legal.

**Layout (scroll + CTA sticky abajo):**
- **Header**: `←` + título [Fredoka 700/21px] `SUBE TU FOTO` + eyebrow
  [Chakra Petch 11px `#F9B41A`] `ESCENARIO PRINCIPAL · VIE` (refleja el escenario elegido).
- **Tabs segmentadas** (`bg #1F1F1F`, radio 14px, pestaña activa `bg #F9B41A` texto `#0E0E0E`):
  `📷 Cámara` | `🖼️ Galería`
- **Zona de preview** (alto 300px, radio 18px, borde `1.5px dashed #3a3a3a`):
  muestra la foto + botón `✕` (círculo) arriba-der + pie [12px] `Vista previa · IMG_2451.jpg`.
  Estado vacío (sin foto): icono cámara grande + texto `Toca para hacer una foto` / `Elige de tu galería`.
- **Campos opcionales** (inputs alto 50px, `bg #1F1F1F`, borde `#2B2B2B`, radio 13px):
  - `Tu nombre (opcional)`
  - fila: `@ Instagram` · `@ TikTok`
  - textarea `Comentario (opcional)` (alto 62px)
- **Legales** (checkbox 22px, radio 6px; activo = `bg #F9B41A` con `✓`):
  - ✅ `Acepto los términos de uso y la cesión de derechos de imagen de mi foto.`
  - ☐ `Confirmo que soy mayor de 18 años o cuento con autorización.`
  - (enlazar "términos" y "derechos de imagen" a las páginas legales)
- **CTA sticky** (alto 58px, pill amarillo, degradado de fondo para despegue):
  `ENVIAR FOTO 🚀`  → deshabilitado hasta marcar ambos checkboxes obligatorios.

---

## 04 · Confirmación  →  `screenshots/04-confirm.png`

**Propósito:** cierre emocional + estado de revisión + siguientes pasos.

**Layout (centrado, foto de fondo desenfocada al 22% + glow amarillo):**
- Check grande: círculo 104px `bg #F9B41A`, `✓` 52px `#0E0E0E`, glow
  `0 0 0 12px rgba(249,180,26,.12)`, anima `pop` al entrar.
- H1 [Fredoka 700/40px]: `¡FOTO ENVIADA!`
- Párrafo [Hanken 16px `#D8D8D8`]: `Acabas de hacer historia en Calatafest. Gracias por compartir tu momento. ✨`
- **Pill de estado** (`bg #1F1F1F`, borde `#2B2B2B`): punto amarillo pulsante +
  `En revisión · aprobación en minutos`
- Botones (abajo): primario pill `VER LA GALERÍA` · secundario contorno `↗ COMPARTIR`

---

## 05 · Galería pública  →  `screenshots/05-gallery.png`

**Propósito:** explorar todas las fotos aprobadas; filtrar; compartir/descargar.

**Layout (scroll):**
- **Header**: logo (mascota 26px + `GALERÍA` [Fredoka 700/21px]) + botón `🔍` (círculo).
- **Carrusel destacado** (alto 200px, radio 20px): foto + overlay + badge
  `★ DESTACADA` (pill amarillo, arriba-izq) + pie (`Escenario Principal` / `Viernes · 23:10`)
  + **dots** (abajo-der; activo amarillo, resto `rgba(255,255,255,.4)`).
- **Filtros (chips)** scroll horizontal (pill, activo `bg #F9B41A` texto `#0E0E0E`,
  inactivo borde `#2B2B2B` texto `#cfcfcf`, [Chakra Petch 600/12px]):
  `Todos · Principal · Ámbar · Electrónica · Local · Viernes · Sábado`
- **Grid masonry** (2 columnas, `column-gap:10px`): PhotoCard = foto (radio 14px) +
  overlay inferior + etiqueta `{escenario} · {día}` (abajo-izq, [Chakra Petch 9px]) +
  acciones al tocar (`↗` compartir / `⤓` descargar, círculos `rgba(0,0,0,.55)`).

---

## 06 · Foto individual  →  `screenshots/06-photo.png`

**Propósito:** ver una foto en grande, descargarla, compartirla, ver su info, pedir retirada.

**Layout (scroll):**
- **Header**: `←` (atrás) + `↗` (compartir).
- **Foto protagonista** (radio 20px, ancho completo) con **marca de agua** abajo-der:
  mascota 20px + `CALATAFEST` [Fredoka 700/12px], opacidad .85.
- **Meta** (chips `bg #1F1F1F` borde `#2B2B2B`, [Chakra Petch 11px]):
  `📍 Escenario Ámbar` · `📅 Viernes 22:40` · `🎤 Set principal`
- **Acciones**: botón primario `⤓ DESCARGAR` (amarillo, alto 54px) + botón cuadrado `↗`.
- **Bloque QR** (`bg #161616` borde `#2B2B2B` radio 18px): QR 78px (blanco) +
  título [Fredoka 700/16px] `Escanea para descargar` + texto [13px `#A8A8A8`]
  `Llévate tu foto en alta calidad a tu móvil.`
- **Enlace retirada** (centrado, [12px `#777` subrayado]): `Solicitar retirada de esta foto`

---

## 07 · Pantalla Live (16:9)  →  `screenshots/07-live.png`

**Propósito:** proyección en las pantallas del recinto. **Sin chrome de navegación, sin cursor.**
Formato fijo 16:9 (1280×720 en el diseño; escalar a 1920×1080).

**Layout:**
- **Top bar** (alto 78px, degradado superior): logo (mascota 42px + `CALATAFEST`
  [Fredoka 700/28px]) · centro: punto pulsante + `FOTOS EN DIRECTO` [Chakra Petch 700/16px
  `#F9B41A` tracking .3em] · der: `VIERNES · 23:42` [Chakra Petch 600/15px].
- **Cuerpo** (2 columnas, gap 22px):
  - **Foto hero** (flex 1.55, radio 18px) con **Ken Burns** lento (zoom infinito alterno) +
    overlay inferior + pie: sub `{ESCENARIO} · {DÍA}` [Chakra Petch 14px `#F9B41A`],
    nombre [Fredoka 700/38px], `@usuario` [17px `#D8D8D8`].
  - **Columna derecha** (flex 1):
    - **Bloque QR** (`bg #fff` radio 18px): QR 118px + `SUBE TU FOTO` [Fredoka 700/24px `#0E0E0E`]
      + `Escanea y aparece en esta pantalla` [15px `#444`].
    - **DESTACADAS AHORA** [Chakra Petch 13px `#888` tracking .2em] + grid 3 thumbnails.
- **Footer** (alto 96px, border-top `#1F1F1F`, `bg #0E0E0E`):
  - izq: overline `PATROCINADORES` + logos (Heraldo · Coca-Cola · Beefeater · Ibercaja · Ámbar)
  - der: [Fredoka 700/18px `#F9B41A`] `#CALATAFEST2026 · fotoscalatafest.com`

**3 variantes** (mismo chrome, distinto cuerpo) — ver `04-INTERACTIONS.md`:
- **Destacadas** (la diseñada): 1 foto grande + 3 thumbs + QR.
- **Carrusel**: una sola foto a casi pantalla completa, QR en esquina, auto-avance.
- **Mosaico**: rejilla animada de 6–9 fotos, QR fijo en esquina, mensajes rotando.

---

## 08 · Panel admin — escritorio  →  `screenshots/08-admin-desktop.png`

**Propósito:** moderar fotos rápido y enviarlas a pantalla.

**Layout (sidebar + main):**
- **Sidebar** (230px, `bg #161616`, border-right `#1F1F1F`): logo `FOTOS·ADMIN` +
  nav (item activo `bg #F9B41A` texto `#0E0E0E`):
  `📊 Dashboard` · `🖼️ Moderación [24]` · `⭐ Destacadas` · `📺 Pantalla Live` ·
  `🏟️ Escenarios` · `⚙️ Ajustes`. Abajo: avatar + `Moderador 1`.
- **Header main**: título [Fredoka 700/26px] `Moderación de fotos` + subtítulo
  `Calatafest 2026 · Viernes, 3 de julio` + `🔎 Buscar` + CTA amarillo
  `📺 Enviar selección a pantalla`.
- **Stats** (4 tarjetas, `bg #161616` borde `#2B2B2B` radio 16px, número [Fredoka 700/34px]):
  `PENDIENTES 24` (amarillo) · `APROBADAS 1.248` (verde) · `SUBIDAS HOY 312` · `EN PANTALLA 8`.
- **Filtros**: chips `PENDIENTES (activo) · TODAS · PRINCIPAL · ELECTRÓNICA · VIERNES`.
- **Grid** (3 columnas, gap 16px) de **ModerationCard**: foto (alto 150px) + badge de estado
  (arriba-izq, color semántico) + nombre/escenario/tiempo + fila de 4 acciones:
  `✓` (verde) · `✕` (rojo) · `★` (amarillo) · `📺` (amarillo).

**Vista móvil del moderador**  →  `screenshots/08b-admin-mobile.png`
- Header `MODERACIÓN` + badge `24 EN COLA`.
- 3 stat chips: `24 PENDIENTES` · `312 HOY OK` · `8 EN PANTALLA`.
- **Tarjeta swipe** (foto grande, contador `1 / 24`, nombre + `ESCENARIO … · HACE 2 MIN`).
- 4 botones grandes (grid 2×2): `✕ Rechazar` (rojo) · `★ Destacar` · `✓ Aprobar` (verde) ·
  `📺 A pantalla` (amarillo). Gesto: swipe derecha = aprobar, izquierda = rechazar.
