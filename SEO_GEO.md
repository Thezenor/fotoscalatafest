# SEO_GEO — Calatafest Fotos

## Objetivo

Máxima visibilidad de las páginas públicas del evento (landing, galería) en buscadores y
asistentes de IA (GEO — Generative Engine Optimization), respetando la privacidad del backoffice.

## SEO técnico

- **SSR/SSG** con Next.js para landing y galerías (contenido indexable).
- **Metadatos dinámicos** por evento con `generateMetadata` (title, description).
- **Open Graph** y **Twitter Cards** para compartir en redes (imagen del evento).
- **URLs limpias y semánticas**: `/{locale}/e/{slug}`, `/{locale}/e/{slug}/gallery`.
- `sitemap.xml` y `robots.txt` dinámicos.
- **noindex** en admin, superadmin, live y páginas de fotos pendientes.

## Multiidioma (i18n SEO)

- **hreflang** por idioma (es/en) y `lang` correcto en `<html>`.
- Rutas con prefijo de locale gestionadas por next-intl (`localePrefix: as-needed`).

## Datos estructurados (Schema.org)

- `Event` con fechas y `location`/`Place` (GEO).
- `ImageObject` para fotos públicas.
- `Organization` para Calatafest.

## GEO (localización geográfica + IA generativa)

- Ubicación del evento en metadatos y datos estructurados (`Place`, coordenadas).
- Contenido descriptivo claro y citable para motores generativos.
- Localización idiomática del contenido (ES/EN) y de los metadatos.

## Rendimiento (Core Web Vitals)

- Imágenes optimizadas (`next/image`, thumbnails servidos por defecto).
- Lazy-loading en galerías, fuentes con `display=swap`.
- Mobile-first → priorizar LCP/CLS en móvil.
