# PROMPT_INICIAL — Calatafest Fotos

Este documento conserva el encargo original y el rol asignado, como referencia histórica.

## Rol

Actuar como **arquitecto principal y jefe técnico** del proyecto **Calatafest Fotos**.

## Encargo

Construir una **plataforma profesional para festival** (no una web genérica ni un simple
formulario de subida) con:

- Mobile-first obligatorio.
- Multiidioma desde el principio.
- Preparada para Railway.
- Superadmin completo.
- Moderación manual e IA.
- Fotos pendientes por defecto.
- Móvil admin sin límites.
- QR único para acceder.
- Banners para elegir escenario/sección.
- Marca de agua configurable.
- QR individual por foto.
- URL live para pantallas.
- Exportación completa del evento.
- Logs y auditoría de todo.
- No se permiten menores en el módulo de fotos.
- El usuario debe aceptar términos y cesión de derechos.
- Diseño que respete la estética de https://www.calatafest.es

## Método acordado

1. Lectura completa de requisitos y propuesta técnica (arquitectura, stack, modelo de datos,
   flujos, fases, orden de implementación) — **entregada y validada**.
2. No programar hasta validar la arquitectura — **validado**.
3. Implementación por fases (ver TASKS_PHASES.md).

## Decisiones tomadas en la validación (2026-06-28)

- IA: Google Vision SafeSearch + Face Detection.
- Auto-aprobar con IA limpia: configurable por evento (OFF por defecto).
- Storage: volumen de Railway (migrable a R2/S3).
- Idiomas iniciales: Español + Inglés.
