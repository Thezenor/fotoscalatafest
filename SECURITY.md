# SECURITY — Calatafest Fotos

## Autenticación y autorización

- Staff (superadmin/admin/moderador) con Auth.js v5 y `passwordHash` (bcrypt, coste 12).
- Público sin login: acceso por **token de QR** del evento (`accessQrToken`), no adivinable.
- **Autorización en servidor** en cada endpoint/acción (middleware + comprobación de rol en servicios).
  Nunca confiar en el cliente.

## Tokens

- `accessQrToken` (acceso al evento) y `downloadQrToken` (descarga por foto) son aleatorios (cuid),
  largos y no enumerables.

## Subida de ficheros

- **URLs firmadas** de corta duración para subir directo al storage.
- Validación de **MIME real** + extensión + tamaño máximo + dimensiones.
- **Re-encoding con sharp** que elimina EXIF/metadatos y posibles payloads embebidos.
- Solo se sirve públicamente la versión con **marca de agua**; el original queda restringido.

## Anti-spam / abuso

- **Rate-limiting** por IP/fingerprint en subida (Redis).
- Límite de subidas por consentimiento/sesión y por ventana de tiempo.
- `uploaderIp` + `uploaderHash` para forense y baneo sin almacenar datos personales de más.

## Hardening web

- Headers de seguridad (CSP, HSTS, X-Content-Type-Options, Referrer-Policy).
- Protección CSRF en mutaciones.
- Sanitización y validación con **Zod** de toda entrada.
- Cookies de sesión `httpOnly`, `secure`, `sameSite`.

## Secretos

- Todas las credenciales en variables de entorno de Railway. **Nunca** en el repositorio.
- `.env` ignorado por git; `.env.example` documenta las claves necesarias.

## Auditoría

- `AuditLog` registra logins, cambios de estado de fotos, exportaciones, borrados y cambios de config.
- Los registros son de solo-añadir (no se editan ni borran desde la app).

## Privacidad por diseño

- Mínimos datos personales del público. EXIF eliminado. Retención definida y borrado documentado.
