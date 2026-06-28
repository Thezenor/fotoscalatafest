# PROJECT_BRIEF — Calatafest Fotos

## Visión

Plataforma oficial de fotos del festival **Calatafest**. Los asistentes escanean un QR,
aceptan los términos legales, eligen el escenario donde están y suben sus fotos. Tras una
doble moderación (IA + manual), las fotos aprobadas se muestran en galerías públicas y en
pantallas live del recinto, y pueden descargarse individualmente mediante un QR por foto.

No es una web genérica ni un mero formulario de subida: es un **producto profesional para eventos**
con backoffice completo.

## Objetivos

- Capturar y mostrar la experiencia del festival a través de las fotos del público.
- Garantizar control editorial y legal absoluto (nada se publica sin aprobar).
- Operación 100% desde el móvil, tanto para el público como para los moderadores.
- Marca y estética alineadas con https://www.calatafest.es

## Usuarios

| Tipo | Acceso | Puede |
|------|--------|-------|
| Asistente (público) | QR del evento (sin login) | Aceptar términos, subir fotos, ver galería, descargar por QR |
| Moderador | Login staff | Aprobar/rechazar la cola de fotos |
| Admin | Login staff | Gestionar su evento, moderar, exportar |
| Superadmin | Login staff | Todo: eventos, usuarios, roles, config, auditoría global, export |

## Requisitos clave

- Mobile-first obligatorio · Multiidioma desde el inicio (ES default, EN).
- QR único de acceso al evento · Banners para elegir escenario/sección.
- Fotos pendientes por defecto · Moderación manual + IA.
- Móvil admin sin límites (aprobación en lote).
- Marca de agua configurable por evento · QR individual por foto para descarga.
- URL live para pantallas (solo aprobadas) · Exportación completa del evento.
- Logs y auditoría de todo · RGPD + cesión de derechos + no menores.
- Preparada para Railway · SEO/GEO desde el día uno.

## Fuera de alcance (por ahora)

- App nativa móvil (la web es responsive/mobile-first).
- Pagos / venta de fotos.
- Reconocimiento facial de identidades (solo detección de edad como apoyo de moderación).

## Decisiones validadas (2026-06-28)

- IA de moderación: **Google Vision SafeSearch** + Face Detection (apoyo menores).
- Auto-aprobar con IA limpia: **configurable por evento** (por defecto OFF).
- Storage: **volumen de Railway** (encapsulado para migrar a R2/S3 sin refactor).
- Idiomas iniciales: **Español (default) + Inglés**.
