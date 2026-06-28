/** Inserta datos estructurados Schema.org (JSON-LD) para SEO/GEO. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // El contenido es generado por el servidor (no entrada de usuario sin escapar).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
