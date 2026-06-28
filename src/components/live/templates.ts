// Plantillas de la pantalla de TV en directo. Módulo neutro (sin "use client")
// para poder importarse tanto desde server components como desde clientes.

export type LiveVariant = "cinematic" | "neon" | "stack" | "mosaico" | "destacadas";

export const TV_TEMPLATES: { key: LiveVariant; label: string; desc: string }[] = [
  { key: "cinematic", label: "Cinematográfica", desc: "Pantalla completa, zoom lento, código gigante y barrido de luz." },
  { key: "neon", label: "Neón", desc: "Marco brillante animado, LIVE parpadeante y patrocinadores en marquesina." },
  { key: "stack", label: "Polaroid", desc: "Las fotos entran como tarjetas apiladas que giran al aparecer." },
  { key: "mosaico", label: "Mosaico", desc: "Cuadrícula dinámica con foco rotatorio y resplandor." },
  { key: "destacadas", label: "Destacadas", desc: "Foto grande + panel con QR y tira de destacadas." },
];
