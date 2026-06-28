# Calatafest Fotos

Plataforma web profesional, **mobile-first** y **multiidioma**, para subir, moderar y mostrar
las fotos del festival **Calatafest**. Acceso por **QR único**, **moderación** (IA + manual),
**galerías públicas** y **pantallas live**, **marca de agua** configurable, **QR individual**
por foto, **superadmin** completo, **auditoría total** y cumplimiento **RGPD**.

> No es una web genérica ni un formulario de subida: es un producto para eventos.

## Stack

Next.js (App Router) + TypeScript · Tailwind v4 · PostgreSQL + Prisma · Auth.js v5 ·
Redis + BullMQ · sharp · next-intl · Zod · Google Vision · Railway.

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [PROJECT_BRIEF.md](PROJECT_BRIEF.md) | Visión, usuarios, requisitos |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura y estructura |
| [DATABASE.md](DATABASE.md) | Modelo de datos (Prisma) |
| [UI_UX.md](UI_UX.md) | Diseño mobile-first y theme |
| [AI_MODERATION.md](AI_MODERATION.md) | Moderación con Google Vision |
| [LEGAL_RGPD.md](LEGAL_RGPD.md) | Legal, consentimiento, RGPD |
| [SECURITY.md](SECURITY.md) | Seguridad y anti-spam |
| [SEO_GEO.md](SEO_GEO.md) | SEO y GEO |
| [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) | Despliegue en Railway |
| [TASKS_PHASES.md](TASKS_PHASES.md) | Fases y orden de implementación |
| [MEMORY_RULES.md](MEMORY_RULES.md) | Reglas de contexto |
| [CLAUDE.md](CLAUDE.md) | Guía para agentes de IA |

## Desarrollo

```bash
npm install
cp .env.example .env      # rellena las variables
npm run db:migrate        # aplica el schema (requiere PostgreSQL)
npm run db:seed           # superadmin + evento de ejemplo
npm run dev               # http://localhost:3000
```

> **Nota local:** en esta máquina `prisma generate` está bloqueado por la intercepción TLS de
> Avast (no afecta a Railway). Ver [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md).

## Despliegue

Preparado para **Railway** (app + PostgreSQL + Redis + volumen). Ver [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md).

## Idiomas

Español (por defecto) e Inglés. Traducciones en [`messages/`](messages/).
