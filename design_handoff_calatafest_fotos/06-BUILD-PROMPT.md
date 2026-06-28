# 06 · Prompt de construcción (pegar en Claude Code / Antigravity)

Copia el bloque de abajo tal cual en el agente. Adjunta esta carpeta completa
(`design_handoff_calatafest_fotos/`) al contexto. El agente debe **leer los `.md` y mirar
las capturas de `/screenshots`** antes de escribir código.

---

```
Eres un ingeniero frontend senior. Vas a construir CALATAFEST FOTOS, una plataforma de
fotos de festival (dominio fotoscalatafest.com) en Next.js (App Router) + Tailwind CSS +
TypeScript. Tienes adjunta una carpeta de handoff de diseño hi-fi.

ANTES DE CODIFICAR:
1. Lee README.md, 01-DESIGN-SYSTEM.md, 02-SCREENS.md, 03-COMPONENTS.md,
   04-INTERACTIONS.md, 05-TECH-STACK.md y 07-I18N-LEGAL.md.
2. Mira TODAS las imágenes de /screenshots: son la referencia visual exacta (hi-fi).
   El archivo design/Calatafest Fotos.dc.html es el diseño vivo; ábrelo si necesitas
   inspeccionar medidas o copys.

IDENTIDAD VISUAL (obligatoria, heredada de Calatafest):
- Modo oscuro permanente. Fondo negro #0E0E0E. La fotografía aporta el color.
- ACENTO ÚNICO: amarillo Calatafest #F9B41A (CTA, foco, badges activos, marquee, destacadas).
  Texto sobre amarillo = #0E0E0E. Nunca mezcles otros colores de UI con el amarillo.
- Tipografía: Fredoka (titulares/botones, redondeada, a menudo en MAYÚSCULAS),
  Hanken Grotesk (cuerpo/formularios), Chakra Petch (badges/eyebrows/etiquetas técnicas).
- Botones pill, CTA principal alto ≥56px, alto contraste, hover scale 1.02.
- Tarjetas radio 20–24px con foto a sangre + overlay degradado para legibilidad.
- Logo Calatafest = mascota de auriculares + wordmark (usa design/mascot-*.svg como
  PLACEHOLDER; deja el componente <Logo/> listo para sustituir por el asset oficial).
- Patrocinadores y logo en monocromo blanco.
- Sensación: nocturna, musical, festivalera, enérgica, juvenil; más rápida y moderna que
  la web oficial, pero claramente parte de Calatafest.

ALCANCE: implementa las 8 pantallas tal y como están documentadas en 02-SCREENS.md:
1) Landing QR  2) Selector de escenario  3) Subida de foto  4) Confirmación
5) Galería pública  6) Foto individual  7) Pantalla Live 16:9 (variantes Destacadas/
Carrusel/Mosaico)  8) Panel admin (escritorio + vista móvil del moderador).

REQUISITOS:
- Mobile-first; rapidísimo de usar en el recinto; hit targets ≥44px (CTA ≥56px).
- Configura Tailwind con los tokens de 05-TECH-STACK.md (colores, fuentes, radios, sombras,
  keyframes) y carga las fuentes con next/font/google.
- Construye los componentes de 03-COMPONENTS.md (Button, Badge, StageCard, PhotoCard,
  FeaturedCarousel, FilterChips, Uploader, QRBlock, LiveStage, ModerationCard, etc.).
- Reproduce las animaciones de 04-INTERACTIONS.md (marquee, Ken Burns, pulse, pop,
  cross-fade del Live, blur-up, hover de cards) y respeta prefers-reduced-motion.
- Multiidioma con next-intl (ES base; estructura para EN/CA). Ningún texto hardcodeado:
  usa las claves de 07-I18N-LEGAL.md.
- Galería: grid masonry + carrusel destacado + filtros (escenario/día). next/image con
  blur placeholder. Botones compartir/descargar y QR por foto.
- Pantalla Live (/live): layout 16:9 a pantalla completa, sin chrome, auto-rotación,
  QR siempre visible, logo y patrocinadores. Soporta ?variant=.
- Admin (/admin): dashboard con StatCards + cola de moderación con acciones rápidas
  (aprobar/rechazar/destacar/enviar a pantalla), optimista con toast de deshacer.
  Vista móvil del moderador con swipe (derecha aprobar, izquierda rechazar).
- Crea rutas API stub (o mocks) según 05-TECH-STACK.md y el modelo Photo/Stage, para que
  la UI funcione con datos de ejemplo (puedes reutilizar /photos como demo). Deja claros
  los puntos de integración con backend/almacenamiento real.

ENTREGABLE: app Next.js que funcione con datos mock, fiel a las capturas, con los
componentes y tokens descritos. Comenta dónde enchufar el backend, la subida de archivos
y los logos oficiales (Calatafest + patrocinadores).

NO te desvíes de la identidad visual. Ante cualquier duda de estilo, gana la captura de
/screenshots y los valores exactos de 01-DESIGN-SYSTEM.md.
```

---

## Checklist de aceptación (para revisar el resultado)
- [ ] Fondo negro, un solo acento amarillo, nada de otros colores de UI.
- [ ] Fredoka en titulares/botones; Hanken en cuerpo; Chakra Petch en badges.
- [ ] CTA principal pill amarillo ≥56px, texto negro.
- [ ] Las 8 pantallas presentes y fieles a `/screenshots`.
- [ ] Galería con masonry + carrusel + filtros funcionando.
- [ ] Pantalla Live 16:9 a pantalla completa, QR visible, auto-rotación.
- [ ] Admin con moderación y acciones rápidas + vista móvil swipe.
- [ ] Animaciones presentes y `prefers-reduced-motion` respetado.
- [ ] Textos vía i18n (sin hardcode); ES completo.
- [ ] `<Logo/>` y `SponsorStrip` listos para sustituir por assets oficiales.
