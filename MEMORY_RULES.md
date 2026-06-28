# MEMORY_RULES — Calatafest Fotos

Reglas de contexto que cualquier agente/colaborador debe recordar siempre.

## Producto

- Plataforma profesional de fotos de festival. **No** es una web genérica ni un simple formulario.
- Mobile-first y multiidioma desde el inicio. Estética alineada con calatafest.es.

## Innegociables

1. Foto siempre `PENDING` al subir. Nada se publica sin moderar.
2. Doble moderación: IA (Google Vision) + manual.
3. Sin consentimiento (cesión de derechos + mayoría de edad/no menores) **no** hay subida; se valida en backend.
4. Prohibido contenido de menores; IA solo de apoyo, la barrera real es consentimiento + humano.
5. Solo se sirven fotos `APPROVED` en galería y live.
6. Auditoría de todo en `AuditLog`.
7. Autorización en servidor, nunca en el cliente.
8. Secretos solo en variables de entorno.

## Decisiones validadas (2026-06-28)

- IA: **Google Vision SafeSearch** + Face Detection (apoyo menores).
- Auto-aprobar con IA limpia: **configurable por evento**, por defecto OFF.
- Storage: **volumen de Railway**, encapsulado en `StorageService` para migrar a R2/S3.
- Idiomas: **ES (default) + EN**.

## Técnicas

- Stack: Next.js App Router + TS, Tailwind v4, Prisma/PostgreSQL, Auth.js v5, BullMQ/Redis,
  sharp, next-intl, Zod. Deploy Railway.
- Lógica en `src/server/services/*`. DB solo vía `src/server/db.ts`. Ficheros solo vía `StorageService`.

## Entorno

- `prisma generate` bloqueado en local por intercepción TLS de Avast; funciona en Railway.
- Repo: https://github.com/Thezenor/fotoscalatafest.git
- El directorio incluye `Nueva carpeta/` con material audiovisual de marca (no parte del código).

## Reglas de trabajo

- No empezar una fase sin validación si cambia la arquitectura.
- Mantener estos documentos `.md` actualizados como fuente de verdad.
