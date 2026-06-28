# CLAUDE.md — Guía para agentes de IA en este repositorio

Este archivo orienta a Claude Code (y cualquier agente) al trabajar en **Calatafest Fotos**.

## Qué es este proyecto

Plataforma web profesional, **mobile-first** y **multiidioma**, para que los asistentes a un
festival suban fotos (acceso por **QR único**), que se **moderan** (IA + manual) antes de
publicarse en **galerías públicas** y **pantallas live**. Incluye **superadmin** completo,
**marca de agua** configurable, **QR individual** por foto, **exportación** del evento,
**auditoría total** y cumplimiento **RGPD**.

## Reglas de oro (innegociables)

1. **Toda foto entra como `PENDING`.** Nunca se publica nada sin pasar moderación.
2. **Prohibido contenido de menores.** Consentimiento de mayoría de edad obligatorio + IA de apoyo.
3. **Sin consentimiento (cesión de derechos + mayoría de edad) no hay subida.** Validar en backend.
4. **Audita todo.** Cada acción relevante escribe en `AuditLog`.
5. **Mobile-first real**, también el backoffice de moderación.
6. **Multiidioma estructural** (next-intl), nunca strings hardcodeados.
7. **Solo se sirven fotos `APPROVED`** en galería pública y live. Imposible filtrar pendientes.
8. **Autorización en servidor**, nunca confiar en el front.

## Stack

Next.js (App Router) + TypeScript · Tailwind v4 · PostgreSQL + Prisma · Auth.js v5 ·
Redis + BullMQ · sharp · next-intl · Zod · Google Vision (moderación). Deploy en **Railway**.

## Convenciones

- Lógica de negocio en `src/server/services/*`, no en componentes ni rutas.
- Validación de entrada con **Zod** en cada endpoint/acción.
- Textos visibles → archivos de `messages/` (es/en).
- Acceso a DB solo vía `src/server/db.ts` (singleton Prisma).
- Storage solo vía `StorageService` (hoy volumen Railway; migrable a S3/R2 sin refactor).

## Documentación

Ver: PROJECT_BRIEF · ARCHITECTURE · DATABASE · UI_UX · AI_MODERATION · LEGAL_RGPD ·
SECURITY · SEO_GEO · RAILWAY_DEPLOY · TASKS_PHASES · MEMORY_RULES · PROMPT_INICIAL.

## Estado actual

**Fase 0 (setup)** completada: scaffold Next.js + i18n + theme + schema Prisma + docs + Railway + git.
Pendiente local: `prisma generate` está bloqueado por la intercepción TLS de Avast en esta máquina
(se resuelve en CI/Railway, Linux). Ver RAILWAY_DEPLOY.md.
