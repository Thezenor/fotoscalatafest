# AI_MODERATION — Calatafest Fotos

## Proveedor

**Google Cloud Vision** (decisión validada):
- **SafeSearch Detection**: categorías `adult`, `violence`, `racy`, `medical`, `spoof`
  (escala `VERY_UNLIKELY` … `VERY_LIKELY`).
- **Face Detection**: como **apoyo** para sospecha de menores (nº de rostros y atributos).

> ⚠️ SafeSearch **no estima edad de forma fiable** y Face Detection **no clasifica menores**.
> Por eso la detección de menores por IA es solo *apoyo*: la barrera real es el
> **consentimiento de mayoría de edad** + **moderación humana**. Ante cualquier duda, la foto
> va a revisión humana, nunca se auto-aprueba.

## Flujo

1. Tras subir, se encola un job (BullMQ).
2. El worker descarga el original, genera thumbnail + versión con marca de agua.
3. Llama a Vision (SafeSearch + Face Detection).
4. Guarda `aiVerdict`, `aiScore` (JSON con scores por categoría) y `aiReviewedAt`.

## Reglas de decisión

| Señal | Verdict | Acción |
|-------|---------|--------|
| `adult`/`racy` = LIKELY/VERY_LIKELY | `NSFW` | `AI_FLAGGED` o `REJECTED` (según config evento) |
| `violence` = LIKELY/VERY_LIKELY | `VIOLENCE` | `AI_FLAGGED` |
| Heurística de rostros sugiere menor | `MINOR_SUSPECTED` | **Siempre** `AI_FLAGGED` (revisión humana obligatoria) |
| Todo limpio | `CLEAN` | `AI_APPROVED`; si `event.autoApproveOnAiClean` ⇒ `APPROVED` |
| Error/timeout API | `ERROR` | `AI_FLAGGED` (nunca auto-aprobar ante fallo) |

- Por defecto `autoApproveOnAiClean = false` ⇒ incluso lo limpio espera aprobación manual.
- Toda decisión de IA escribe en `AuditLog`.

## Configuración

- Credenciales: `GOOGLE_APPLICATION_CREDENTIALS` (JSON de service account) o
  `GOOGLE_VISION_KEY` según método. Ver `.env.example`.
- Umbrales configurables en `ai-moderation.service.ts` (constantes revisables sin migración).

## Resiliencia

- Reintentos con backoff en el job.
- Si Vision no está disponible, la foto permanece en cola humana (`AI_FLAGGED`), nunca se publica.
