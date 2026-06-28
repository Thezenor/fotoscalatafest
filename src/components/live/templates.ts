// Plantillas de la pantalla de TV en directo. Módulo neutro (sin "use client")
// para poder importarse tanto desde server components como desde clientes.

export type LiveVariant =
  | "destacadas"
  | "carrusel"
  | "mosaico"
  | "cinematic"
  | "neon"
  | "stack";

export const TV_TEMPLATES: { key: LiveVariant; label: string; desc: string }[] = [
  // Clásicas (diseño original)
  { key: "destacadas", label: "Destacadas", desc: "Foto grande + panel con QR y tira de destacadas. (Clásica)" },
  { key: "carrusel", label: "Carrusel", desc: "Una foto a pantalla con zoom lento y QR en esquina. (Clásica)" },
  { key: "mosaico", label: "Mosaico", desc: "Cuadrícula 3×3 con foco rotatorio. (Clásica)" },
  // Dinámicas (llamativas)
  { key: "cinematic", label: "Cinematográfica", desc: "Pantalla completa, zoom lento, código gigante y barrido de luz." },
  { key: "neon", label: "Neón", desc: "Marco brillante animado, LIVE parpadeante y patrocinadores en marquesina." },
  { key: "stack", label: "Polaroid", desc: "Las fotos entran como tarjetas apiladas que giran al aparecer." },
];
