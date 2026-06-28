# UI_UX — Calatafest Fotos

## Principios

- **Mobile-first absoluto.** Diseñar primero para móvil; el desktop es secundario.
- **Estética Calatafest.** Alinear con https://www.calatafest.es (colores, tipografía, tono).
  El theme está centralizado en tokens CSS (`src/app/globals.css`) para re-theming sin tocar componentes.
- **Multiidioma** en toda la interfaz (selector visible, ES por defecto).
- **Velocidad percibida**: estados de carga claros, subida con feedback inmediato ("pendiente de aprobación").

## Theme (provisional, pendiente de inspección de calatafest.es)

Festival nocturno → base oscura con acentos vibrantes:
- `background` oscuro, `foreground` claro.
- `primary` magenta, `secondary` violeta, `accent` cian eléctrico.
- Radios generosos, tipografía sans potente para titulares.

> ⚠️ Estos valores son provisionales. El **primer paso de la Fase 1** es inspeccionar
> calatafest.es y fijar la paleta/tipografía reales.

## Pantallas públicas

1. **Landing del evento** (aterriza el QR): hero con marca, selector de idioma, banners de escenarios.
2. **Selección de escenario**: banners grandes y táctiles (`Stage.bannerUrl`).
3. **Muro legal/consentimiento**: dos checks obligatorios + enlace a términos; botón deshabilitado hasta aceptar.
4. **Subida**: selector de foto, barra de progreso, aviso "pendiente de aprobación".
5. **Galería**: grid mobile-first, solo aprobadas, lazy-load.
6. **Foto individual**: imagen con marca de agua + **QR de descarga** + botón descargar.
7. **Páginas legales**: términos, privacidad, cookies.

## Backoffice (admin/moderador) — mobile-first

- **Cola de moderación**: tarjetas a pantalla completa, foto grande + verdict IA + escenario.
- **Gestos/botones grandes**: Aprobar ✅ / Rechazar ❌ (con motivo) / Saltar ⏭️.
- **Lote**: selección múltiple para aprobar/rechazar en masa, sin límites.
- **Prioridad**: lo marcado por IA (`AI_FLAGGED`) aparece arriba.

## Pantallas live (proyector)

- Fullscreen, sin UI de navegación, slideshow en bucle de fotos `APPROVED`.
- Auto-refresh/realtime para nuevas aprobadas.
- Filtro opcional por escenario (cada pantalla su escenario).
- Branding del festival y marca de agua.

## Accesibilidad

- Contraste suficiente sobre fondo oscuro, foco visible, targets táctiles ≥ 44px,
  textos alternativos, navegación por teclado en el backoffice.
