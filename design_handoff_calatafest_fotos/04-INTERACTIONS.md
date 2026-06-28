# 04 · Interacciones, animaciones y estado

---

## 1. Flujo de navegación

```
[QR] → 01 Landing
           ├─ "SUBIR MI FOTO" → 02 Selector → 03 Subida → 04 Confirmación
           │                                                   ├─ "VER GALERÍA" → 05 Galería
           │                                                   └─ "COMPARTIR" → share nativo
           └─ "VER GALERÍA" → 05 Galería → (tap foto) → 06 Foto individual

[Pantalla recinto] → 07 Live (independiente, sin navegación, pantalla completa)
[/admin] → 08 Admin (escritorio) ←→ vista móvil moderador
```

Rutas Next.js sugeridas en `05-TECH-STACK.md`.

---

## 2. Animaciones (todas respetan `prefers-reduced-motion`)

| Nombre | Dónde | Definición |
|---|---|---|
| `marq` | Marquee landing/Live | `translateX(0 → -50%)`, lineal, 16s, infinito (contenido duplicado) |
| `kb` (Ken Burns) | Foto hero Live | `scale(1.02 → 1.14)`, ease-in-out, 7s, alternate, infinito |
| `pls` (pulse) | Punto "en directo"/"en revisión" | `opacity 1 → .4 → 1`, 1.4s, infinito |
| `pop` | Check de confirmación | `scale(.5)→1.12→1` + fade-in, .5s, ease |
| Hover card | PhotoCard/StageCard | `scale(1.03)`, 200ms ease-out |
| Hover botón | Botones | `brightness(1.08) scale(1.02)`, 150ms |
| Active botón | Botones | `scale(.98)` |
| Cross-fade Live | Cambio de foto | opacidad 500–700ms entre slides |
| Blur-up | Carga de fotos | placeholder borroso → nítido (`next/image` `placeholder="blur"`) |
| Filtro (FLIP) | Galería al filtrar | transición de layout del grid, ~300ms |
| Transición ruta | Entre pantallas | slide-up sutil (opcional, Framer Motion) |
| Confirmación | Al enviar foto | `pop` + (opcional) confeti breve |

Sugerencia: **Framer Motion** para transiciones de ruta y el cross-fade del Live;
CSS keyframes para marquee/KenBurns/pulse.

---

## 3. Estados por componente

**Uploader**
- Vacío (sin foto): dropzone con icono + texto guía.
- Con foto: preview + nombre + botón quitar.
- Subiendo: barra de progreso sobre el preview.
- Error: borde rojo + mensaje (`No se pudo subir, inténtalo de nuevo`).

**CTA Enviar (Subida)**
- Deshabilitado hasta que ambos checkboxes obligatorios estén marcados.
- Loading: spinner + `ENVIANDO…`.

**Galería**
- Loading: skeletons (rectángulos `surface-2` con shimmer).
- Vacío por filtro: `Aún no hay fotos de este escenario` + CTA subir.
- Foto: hover muestra acciones.

**Confirmación**
- Estado revisión (pendiente, por defecto): punto amarillo pulsante.
- (Opcional) si auto-aprueba: cambiar a verde `Aprobada · ya visible en la galería`.

**Admin / Moderación**
- Acción aprobar/rechazar/destacar: feedback inmediato (la tarjeta sale de la cola con animación)
  + toast (`Foto aprobada`, deshacer disponible 5s).
- `A pantalla`: marca la foto como "en pantalla" (badge) y la añade al pool del Live.

**Pantalla Live**
- Sin interacción humana. Auto-rotación. Si no hay fotos: pantalla de marca
  (`SUBE TU FOTO · ESCANEA EL QR`) con QR grande.

---

## 4. Estado y datos (front)

**Estado global mínimo:**
- `lang` (ES/EN/CA) — persistente (localStorage/cookie).
- `selectedStage` — escenario elegido en el Selector (lo arrastra Subida).
- `uploadDraft` — { file, name, instagram, tiktok, comment, acceptTerms, acceptAge }.

**Estado local destacado:**
- Galería: `filter` (chip activo) → filtra el listado; `featuredIndex` (carrusel).
- Live: `index` con `setInterval` (intervalo configurable, def. 3800ms) + `variant`.
- Admin: `queue`, acciones optimistas con rollback.

**Datos (ver modelo en `05-TECH-STACK.md`):**
- `GET /api/photos?status=approved&stage=&day=` → galería pública.
- `GET /api/photos/:id` → foto individual.
- `POST /api/photos` (multipart) → subida (status inicial `pending`).
- `GET /api/stages` → escenarios.
- Admin: `GET /api/admin/photos?status=pending`, `PATCH /api/admin/photos/:id`
  ({ status: approved|rejected, featured, onScreen }).
- Live: `GET /api/live` (fotos aprobadas + onScreen) — idealmente con
  polling/SSE/WebSocket para refrescar en tiempo real.

**QR:** se generan en cliente con `qrcode.react`. El QR de Live apunta a la landing
(`https://fotoscalatafest.com/?stage=…`); el QR de foto individual apunta a la URL de descarga
(`/api/photos/:id/download` o `/foto/:id`).

---

## 5. Responsive
- **Móvil** (base): 1 columna, padding 18–22px, CTA sticky abajo, masonry 2 columnas.
- **Tablet/Desktop**: contenedor máx 1280–1440px, masonry 3–4 columnas, header horizontal,
  carrusel con flechas laterales. La galería y la foto individual escalan; el resto del flujo
  (subida/confirmación) se centra con ancho máx ~480px.
- **Pantalla Live**: layout propio 16:9, **siempre** a pantalla completa (`/live`), sin chrome.
- **Admin**: sidebar fijo en escritorio; en móvil colapsa a la vista swipe del moderador.
