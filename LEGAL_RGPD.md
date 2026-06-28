# LEGAL_RGPD — Calatafest Fotos

## Principios

- **Sin consentimiento no hay subida.** El backend valida que existe un `Consent` válido antes
  de aceptar cualquier foto. No basta con el check del front.
- **Mayoría de edad obligatoria** y declaración de que **no aparecen menores** en la foto.
- **Cesión de derechos** de uso de las fotos al festival, según términos versionados.

## Registro de consentimiento (`Consent`)

Cada aceptación guarda: `termsVersion`, `acceptedRights`, `confirmedAdult`, `ip`, `userAgent`,
`acceptedAt`. Las fotos subidas bajo esa sesión enlazan a su `consentId`.

## Términos versionados

- Cada cambio de los términos incrementa `termsVersion`.
- El consentimiento almacena exactamente qué versión aceptó el usuario (prueba de conformidad).

## Páginas legales

- Términos y condiciones · Política de privacidad · Política de cookies · Información RGPD.
- Accesibles desde el muro de consentimiento y el pie de página.

## Derechos RGPD

- **Acceso / supresión**: mecanismo de contacto para solicitar la eliminación de una foto.
- La eliminación borra los ficheros del storage y deja **registro en `AuditLog`** (qué, quién, cuándo).
- Datos personales minimizados: no se piden nombre/email al público; se guarda IP/fingerprint
  solo con fines de seguridad y prueba, con base legítima y plazo de conservación definido.

## Menores

- Declaración obligatoria de mayoría de edad y de ausencia de menores.
- IA de apoyo (`MINOR_SUSPECTED`) fuerza revisión humana.
- Cualquier foto con menores detectada o sospechada se rechaza.

## Cookies

- Banner de cookies si se usan analíticas/no esenciales. Las estrictamente necesarias
  (sesión/idioma) no requieren consentimiento.

## Retención y exportación

- Exportación del evento (fotos aprobadas + metadatos + consentimientos) para el responsable del tratamiento.
- Política de retención: borrado o anonimización tras el plazo definido por el festival.
