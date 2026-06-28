# 07 · Multiidioma (i18n) y textos legales

## 1. i18n

- Librería recomendada: **next-intl** (App Router).
- Idiomas: **ES** (base, completo), **EN** y **CA** (catalán) preparados.
- Reservar ~30% de ancho extra para traducciones (ES suele ser más corto que otros).
- Ningún texto hardcodeado. Estructura de mensajes sugerida (`messages/es.json`):

```json
{
  "common": {
    "uploadPhoto": "Subir mi foto",
    "viewGallery": "Ver galería",
    "share": "Compartir",
    "download": "Descargar",
    "back": "Atrás"
  },
  "landing": {
    "eyebrow": "Revive el festival",
    "title": "Tus fotos del Calatafest",
    "subtitle": "Escanea, sube tu foto y revive la noche. Las mejores se proyectan en las pantallas del recinto.",
    "marquee": "Calatafest Fotos · 3—4 Julio 2026 · Sube tus fotos del festival ·",
    "chooseStage": "Elige tu escenario",
    "seeAll": "Ver todos",
    "sponsors": "Con el apoyo de"
  },
  "selector": {
    "title": "Elige escenario",
    "subtitle": "¿Dónde estás ahora mismo?",
    "cta": "Subir foto aquí"
  },
  "upload": {
    "title": "Sube tu foto",
    "tabCamera": "Cámara",
    "tabGallery": "Galería",
    "name": "Tu nombre (opcional)",
    "instagram": "@ Instagram",
    "tiktok": "@ TikTok",
    "comment": "Comentario (opcional)",
    "legalRights": "Acepto los términos de uso y la cesión de derechos de imagen de mi foto.",
    "legalAge": "Confirmo que soy mayor de 18 años o cuento con autorización.",
    "submit": "Enviar foto"
  },
  "confirm": {
    "title": "¡Foto enviada!",
    "message": "Acabas de hacer historia en Calatafest. Gracias por compartir tu momento.",
    "status": "En revisión · aprobación en minutos"
  },
  "gallery": {
    "title": "Galería",
    "featured": "Destacada",
    "filters": { "all": "Todos", "friday": "Viernes", "saturday": "Sábado" },
    "empty": "Aún no hay fotos de este escenario"
  },
  "photo": {
    "scanToDownload": "Escanea para descargar",
    "scanCaption": "Llévate tu foto en alta calidad a tu móvil.",
    "requestRemoval": "Solicitar retirada de esta foto"
  },
  "live": {
    "liveNow": "Fotos en directo",
    "scanTitle": "Sube tu foto",
    "scanCaption": "Escanea y aparece en esta pantalla",
    "featuredNow": "Destacadas ahora",
    "sponsors": "Patrocinadores"
  },
  "admin": {
    "moderation": "Moderación de fotos",
    "pending": "Pendientes",
    "approved": "Aprobadas",
    "uploadedToday": "Subidas hoy",
    "onScreen": "En pantalla",
    "approve": "Aprobar",
    "reject": "Rechazar",
    "feature": "Destacar",
    "sendToScreen": "Enviar a pantalla",
    "sendSelection": "Enviar selección a pantalla"
  }
}
```

> Los nombres de escenario (Escenario Principal, Ámbar, etc.) y el wordmark CALATAFEST
> **no se traducen**.

---

## 2. Textos y requisitos legales

La web hereda las políticas de calatafest.es. Enlazar en el footer y en la subida:
- **Aviso Legal**
- **Política de Protección de Datos**
- **Política de Privacidad**
- **Política de Cookies**

### Puntos clave a cubrir (revisar con asesoría legal del festival)
- **Cesión de derechos de imagen**: el usuario acepta que su foto se publique en la galería,
  se proyecte en las pantallas del recinto y se use en canales del festival. Checkbox
  **obligatorio** en la subida.
- **Mayoría de edad / autorización**: checkbox obligatorio (festival con acceso a menores —
  ver sección "Menores" de la web oficial).
- **Personas identificables**: aviso de que no se suban fotos de terceros sin su consentimiento;
  proceso de **"Solicitar retirada"** (pantalla 06) que crea una solicitud para el admin.
- **Moderación previa**: ninguna foto es pública hasta ser **aprobada** (estado `pending` → `approved`).
- **RGPD**: base legal del tratamiento, responsable, derechos ARCO, y banner de **cookies**.
- **Datos opcionales** (nombre, Instagram, TikTok, comentario): dejar claro que son opcionales
  y cómo se mostrarán (p. ej. el @ aparece en la pantalla Live y en la galería).

### Flujo de retirada (06 → admin)
`Solicitar retirada` abre un formulario corto (motivo + email de contacto) → crea un
ticket que aparece en el admin para revisión y posible despublicación/borrado de la foto.

> ⚠️ Estos son requisitos de producto, no asesoría jurídica. Los textos legales definitivos
> los aporta el equipo legal de Calatafest.
