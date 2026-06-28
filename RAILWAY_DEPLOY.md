# RAILWAY_DEPLOY — Calatafest Fotos

## Servicios en Railway

1. **App** (Next.js) — este repositorio.
2. **PostgreSQL** (plugin) — provee `DATABASE_URL`.
3. **Redis** (plugin) — provee `REDIS_URL` (cola BullMQ + rate-limit).
4. **Volumen** montado para el storage de fotos (ver `STORAGE_PATH`).

## Variables de entorno

Ver [.env.example](.env.example). Mínimas para producción:

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://<tu-dominio>
STORAGE_DRIVER=railway-volume
STORAGE_PATH=/data/uploads          # ruta del volumen montado
GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-vision.json   # o GOOGLE_VISION_KEY
NEXT_PUBLIC_SITE_URL=https://<tu-dominio>
```

## Build & release

- **Build**: `npm run build` (Nixpacks detecta Next.js automáticamente).
- **Prisma**: `prisma generate` se ejecuta en build (Linux, sin el bloqueo TLS de Avast local)
  y `prisma migrate deploy` en el arranque/release para aplicar migraciones.
- **Start**: `npm run start`.

Comando de release sugerido:

```
npx prisma migrate deploy && npm run start
```

## Worker de cola

El procesado (thumbnails, watermark, IA) corre con BullMQ. Opciones:
- **Mismo servicio** (worker in-process) para simplicidad inicial, o
- **Servicio worker separado** en Railway que comparte `DATABASE_URL`/`REDIS_URL` (recomendado al escalar).

## Volumen y storage

- Hoy: **volumen de Railway** vía `StorageService` (`STORAGE_DRIVER=railway-volume`).
- Migración futura a **Cloudflare R2 / S3**: implementar el driver correspondiente en
  `StorageService` y cambiar `STORAGE_DRIVER` — sin tocar el resto del código.

## Nota sobre el entorno local

`prisma generate` está bloqueado en la máquina de desarrollo por la intercepción TLS de Avast
(certificado intermedio no verificable contra `binaries.prisma.sh`). No afecta a Railway.
Para desbloquear en local: usar una red sin interceptación TLS, o proporcionar la **cadena
completa** del certificado de Avast en `NODE_EXTRA_CA_CERTS`.
