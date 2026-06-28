# ARCHITECTURE — Calatafest Fotos

## Enfoque

**Monolito modular Next.js (App Router) full-stack**, desplegado en Railway. Un único
despliegue, SSR para SEO, API Routes/Server Actions como backend, y separación por módulos
(público, admin, superadmin, live) en lugar de microservicios.

## Diagrama lógico

```
                    ┌──────────────────────── RAILWAY ────────────────────────┐
   QR evento  ─────►│  Next.js App (SSR + API)                                 │
   navegador        │   ├─ (public)  landing, banners, upload, gallery, photo  │
                    │   ├─ admin     moderación móvil, eventos, export         │
                    │   ├─ superadmin gestión global                           │
                    │   ├─ live       slideshow para pantallas                 │
                    │   └─ api        upload, photos, moderation, webhooks      │
   pantalla live ──►│                                                          │
                    │  Worker (BullMQ)  thumbnails · watermark · IA            │
                    └───┬───────────────┬───────────────┬────────────────────-┘
                        │               │               │
                   ┌────▼────┐   ┌──────▼─────┐   ┌──────▼──────────┐
                   │Postgres │   │   Redis    │   │ Storage (volumen│
                   │(Prisma) │   │(cola+cache)│   │ Railway → R2/S3)│
                   └─────────┘   └────────────┘   └─────────────────┘
                                                          │
                                                   ┌──────▼──────┐
                                                   │Google Vision│
                                                   └─────────────┘
```

## Principios

1. **Subida directa al storage** mediante URLs firmadas; el servidor no hace de proxy de archivos.
2. **Procesamiento asíncrono**: al subir se encola un job → thumbnail + watermark + análisis IA.
   El usuario no espera. La foto queda `PENDING`.
3. **Máquina de estados estricta** para la foto: `PENDING → AI_* → APPROVED | REJECTED`.
4. **Separación pública/privada**: las superficies públicas (galería, live, descarga) consultan
   exclusivamente `status = APPROVED`.
5. **Servicios**: toda la lógica de negocio vive en `src/server/services/*` y es testeable.
6. **StorageService** abstrae el backend de ficheros para migrar sin tocar el resto.

## Capas

- **Presentación**: React Server Components + Client Components puntuales (formularios, gestos).
- **Aplicación**: Server Actions / Route Handlers, validan con Zod y delegan en servicios.
- **Dominio/servicios**: photo, moderation, ai-moderation, watermark, consent, audit, export, storage.
- **Datos**: Prisma sobre PostgreSQL; Redis para cola/cache/rate-limit.

## Estructura de carpetas

```
src/
  app/[locale]/
    (public)/ e/[eventSlug]/{page,upload,gallery,photo/[id]}  legal/  live/[eventSlug]/
    admin/{moderation,events,export}
    superadmin/
  api/{upload,photos,moderation,webhooks,auth}
  components/{ui,public,admin,live}
  server/{db.ts, services/, queue/, auth/}
  i18n/  lib/  styles/
prisma/{schema.prisma, migrations/, seed.ts}
messages/{es,en}.json
```

## Decisiones técnicas

- **Next.js App Router** por SSR/SEO y colocación de backend.
- **Prisma** por migraciones y tipado fuerte.
- **BullMQ + Redis** por procesado fiable fuera del ciclo request/response.
- **sharp** para thumbnails y marca de agua.
- **next-intl** para i18n estructural con routing por locale.
