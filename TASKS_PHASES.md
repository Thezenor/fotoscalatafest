# TASKS_PHASES — Calatafest Fotos

## Fases

| Fase | Objetivo | Estado |
|------|----------|--------|
| **0 — Setup** | Scaffold Next.js, Tailwind, Prisma, i18n, theme, docs, Railway, git | ✅ Completada |
| **1 — Core data + Auth** | Migración Prisma aplicada, Auth.js, roles, middleware, AuditLog | ⏳ Siguiente |
| **2 — Acceso QR + Legal** | QR de evento, landing, banners de escenarios, muro de consentimiento | Pendiente |
| **3 — Subida** | URLs firmadas, cola, estado PENDING | Pendiente |
| **4 — Marca de agua** | Worker watermark configurable | Pendiente |
| **5 — Moderación manual** | Backoffice móvil, cola, lote, aprobar/rechazar + auditoría | Pendiente |
| **6 — Moderación IA** | Google Vision, verdicts, reglas (menores/NSFW) | Pendiente |
| **7 — Galería + QR foto** | Galería de aprobadas, página de foto, QR de descarga individual | Pendiente |
| **8 — Pantallas live** | URL live, slideshow realtime, fullscreen | Pendiente |
| **9 — Superadmin + Export** | Dashboard, usuarios/eventos, export ZIP+CSV | Pendiente |
| **10 — SEO/GEO + Hardening** | Metadatos, sitemap, schema.org, rate-limit, seguridad, QA | Pendiente |

## Orden exacto de implementación

1. Setup base ✅
2. Inspeccionar calatafest.es y fijar theme (paleta/tipografía) ← **primer paso Fase 1**
3. Migración Prisma inicial + servicio de auditoría
4. Auth.js + roles + middleware de autorización
5. StorageService (volumen Railway) + servicio de fotos
6. Cola/worker base (BullMQ + Redis)
7. Acceso por QR + landing + banners de escenarios
8. Muro legal/consentimiento (validado en backend)
9. Subida → PENDING + encolado
10. Worker: thumbnail + marca de agua
11. Backoffice de moderación manual (mobile-first, lote)
12. Moderación IA (Vision, reglas menores/NSFW)
13. Galería pública + página de foto + QR de descarga
14. Pantallas live (realtime, fullscreen)
15. Superadmin: dashboard, usuarios/eventos, watermark config, export ZIP+CSV
16. SEO/GEO (metadata, sitemap, schema.org, hreflang)
17. Hardening: rate-limit, anti-spam, CSP, validación de ficheros, QA
18. Despliegue final Railway + checklist RGPD

## Definición de "hecho" por fase

- Código tipado (sin errores TS), validado con Zod donde aplica.
- Textos en i18n (es/en).
- Acciones relevantes auditadas.
- Probado en móvil.
