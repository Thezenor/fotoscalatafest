# DATABASE — Calatafest Fotos

PostgreSQL gestionado con **Prisma**. Esquema fuente: [prisma/schema.prisma](prisma/schema.prisma).

## Entidades

### Event
Un festival/edición. Contiene el **QR de acceso** (`accessQrToken`), la configuración de
**marca de agua** (enabled, logo, posición, opacidad) y la política de moderación
(`autoApproveOnAiClean`, por defecto `false`).

### Stage
Escenario o sección del evento (lo que el usuario elige por **banners**). Único por `(eventId, slug)`.

### Photo
Unidad central. Nace en `PENDING`. Guarda claves de storage (`originalKey`, `watermarkedKey`,
`thumbnailKey`), resultado de IA (`aiVerdict`, `aiScore`, `aiReviewedAt`), datos de moderación
manual (`moderatedBy`, `moderatedAt`, `rejectReason`), el `downloadQrToken` (generado al aprobar),
el `consentId` asociado y datos forenses (`uploaderIp`, `uploaderHash`).

### Consent
Registro legal de cada aceptación: `termsVersion`, `acceptedRights` (cesión de derechos),
`confirmedAdult` (mayoría de edad + sin menores), `ip`, `userAgent`, `acceptedAt`.

### User
Personal interno (SUPERADMIN / ADMIN / MODERATOR) con `passwordHash` e `isActive`.

### AuditLog
Bitácora inmutable de toda acción relevante: `action`, `entityType`, `entityId`, `metadata`,
`userId`, `ip`, `createdAt`.

## Enums

- `Role`: SUPERADMIN · ADMIN · MODERATOR
- `PhotoStatus`: PENDING · AI_FLAGGED · AI_APPROVED · APPROVED · REJECTED
- `AiVerdict`: PENDING · CLEAN · NSFW · VIOLENCE · MINOR_SUSPECTED · ERROR

## Máquina de estados de la foto

```
        subida
          │
          ▼
       PENDING ──(IA)──► AI_FLAGGED ──(rechazo manual)──► REJECTED
          │                  │
          │                  └──(aprobación manual)──► APPROVED
          │
          └──(IA limpia)──► AI_APPROVED ──(manual)──► APPROVED | REJECTED
                                  │
                                  └─(si autoApproveOnAiClean)─► APPROVED
```

`MINOR_SUSPECTED` o `NSFW` alto ⇒ nunca auto-aprobar; van a `AI_FLAGGED` (o `REJECTED` según config).

## Índices

`Photo(eventId,status)`, `Photo(status,createdAt)` para la cola de moderación y galerías;
`AuditLog(entityType,entityId)` y `(action,createdAt)` para trazabilidad.

## Desarrollo local (Docker)

PostgreSQL y Redis se levantan con [docker-compose.yml](docker-compose.yml):

```bash
docker compose up -d        # postgres en localhost:5434, redis en 6379
npx prisma migrate deploy   # aplica migraciones
npm run db:seed             # superadmin + evento de ejemplo
```

> El puerto host de Postgres es **5434** (el 5432/5433 estaban ocupados por otros proyectos).
> Ajusta `DATABASE_URL` en tu `.env` en consecuencia.

## Migraciones

- Desarrollo: `npm run db:migrate` (crea nuevas migraciones) o `prisma migrate deploy` (aplica).
- Producción (Railway): `npm run db:deploy` (en el paso de release/start).
- Datos iniciales: `npm run db:seed` (crea superadmin y un evento de ejemplo).

> En local, los comandos Prisma requieren `NODE_EXTRA_CA_CERTS` apuntando al bundle de
> certificados (ver RAILWAY_DEPLOY.md, sección entorno local / Avast).

> Nota: en esta máquina `prisma generate` está bloqueado por la intercepción TLS de Avast.
> Se ejecuta correctamente en Railway (Linux). Ver RAILWAY_DEPLOY.md.
