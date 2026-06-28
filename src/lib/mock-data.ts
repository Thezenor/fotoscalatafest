/**
 * Datos de DEMO para la UI (handoff). En producción provienen de la DB (Prisma)
 * y del storage real de subidas. Puntos de integración marcados con TODO(backend).
 */

export type Day = "VIE" | "SÁB";

export interface Stage {
  id: string;
  name: string;
  sub: string;
  day: string; // "VIE" | "SÁB" | "VIE · SÁB"
  image: string;
  order: number;
}

export type PhotoStatus = "pending" | "approved" | "rejected";

export interface Photo {
  id: string;
  url: string; // alta calidad
  thumbUrl: string; // optimizada
  width: number;
  height: number;
  stageId: string;
  stageName: string;
  day: Day;
  time?: string;
  author?: { name?: string; instagram?: string; tiktok?: string };
  comment?: string;
  status: PhotoStatus;
  featured: boolean;
  onScreen: boolean;
  aiVerdict?: string; // PENDING | CLEAN | NSFW | VIOLENCE | MINOR_SUSPECTED | ERROR
  printCode?: string; // código único visible para identificar/imprimir
  downloadFree?: boolean; // el evento permite descarga gratuita (si no, solo compra/impresión)
  createdAt: string;
}

// Los nombres de escenario NO se traducen (ver 07-I18N-LEGAL.md).
export const STAGES: Stage[] = [
  { id: "principal", name: "Escenario Principal", sub: "HEADLINERS", day: "VIE · SÁB", image: "/demo/p01.png", order: 0 },
  { id: "ambar", name: "Escenario Ámbar", sub: "INDIE & POP", day: "VIE", image: "/demo/p15.png", order: 1 },
  { id: "electronica", name: "Carpa Electrónica", sub: "DJ SETS · LATE NIGHT", day: "SÁB", image: "/demo/p03.png", order: 2 },
  { id: "local", name: "Escenario Local", sub: "BANDAS DE CALATAYUD", day: "VIE", image: "/demo/p14.png", order: 3 },
];

const dims: Record<string, [number, number]> = {
  "p15.png": [900, 1350],
  "p05.png": [900, 675],
  "p12.png": [900, 675],
  "p13.png": [900, 675],
};
const dim = (file: string): [number, number] => dims[file] ?? [900, 600];

interface Seed {
  file: string;
  stageId: string;
  day: Day;
  time: string;
  author?: Photo["author"];
  status?: PhotoStatus;
  featured?: boolean;
  onScreen?: boolean;
}

const SEEDS: Seed[] = [
  { file: "p01.png", stageId: "principal", day: "VIE", time: "23:10", author: { instagram: "@laura.m" }, featured: true, onScreen: true, status: "approved" },
  { file: "p02.png", stageId: "electronica", day: "VIE", time: "01:20", author: { instagram: "@nightowl" }, status: "approved", onScreen: true },
  { file: "p03.png", stageId: "ambar", day: "VIE", time: "22:40", author: { name: "Pablo" }, status: "approved" },
  { file: "p04.png", stageId: "local", day: "SÁB", time: "20:05", status: "approved" },
  { file: "p05.png", stageId: "electronica", day: "SÁB", time: "02:10", author: { instagram: "@crewclt" }, status: "approved", featured: true },
  { file: "p06.png", stageId: "principal", day: "VIE", time: "23:55", status: "approved", onScreen: true },
  { file: "p07.png", stageId: "principal", day: "SÁB", time: "21:30", author: { name: "Sara G." }, status: "pending" },
  { file: "p08.png", stageId: "ambar", day: "VIE", time: "22:00", status: "approved" },
  { file: "p09.png", stageId: "electronica", day: "SÁB", time: "01:45", status: "approved", featured: true },
  { file: "p10.png", stageId: "principal", day: "VIE", time: "00:15", author: { instagram: "@nightowl" }, status: "pending" },
  { file: "p11.png", stageId: "local", day: "VIE", time: "19:40", status: "approved" },
  { file: "p12.png", stageId: "ambar", day: "VIE", time: "23:20", author: { name: "Lucía" }, status: "pending" },
  { file: "p13.png", stageId: "principal", day: "SÁB", time: "22:50", status: "rejected" },
  { file: "p14.png", stageId: "local", day: "SÁB", time: "20:30", status: "approved" },
  { file: "p15.png", stageId: "ambar", day: "VIE", time: "21:10", author: { name: "Anónimo" }, status: "approved" },
  { file: "p16.png", stageId: "electronica", day: "SÁB", time: "03:00", status: "approved", onScreen: true },
  { file: "p17.png", stageId: "principal", day: "SÁB", time: "23:42", author: { instagram: "@crewclt" }, status: "approved", featured: true, onScreen: true },
];

export const PHOTOS: Photo[] = SEEDS.map((s, i) => {
  const stage = STAGES.find((st) => st.id === s.stageId)!;
  const [w, h] = dim(s.file);
  return {
    id: `ph_${String(i + 1).padStart(2, "0")}`,
    url: `/demo/${s.file}`,
    thumbUrl: `/demo/${s.file}`,
    width: w,
    height: h,
    stageId: s.stageId,
    stageName: stage.name,
    day: s.day,
    time: s.time,
    author: s.author,
    status: s.status ?? "approved",
    featured: s.featured ?? false,
    onScreen: s.onScreen ?? false,
    createdAt: "2026-07-03T22:00:00.000Z",
  };
});

// ── Selectores de demo (en producción: queries Prisma) ──
export const getStages = () => [...STAGES].sort((a, b) => a.order - b.order);
export const getStage = (id: string) => STAGES.find((s) => s.id === id) ?? null;
export const getApprovedPhotos = () => PHOTOS.filter((p) => p.status === "approved");
export const getFeaturedPhotos = () => PHOTOS.filter((p) => p.featured && p.status === "approved");
export const getOnScreenPhotos = () =>
  PHOTOS.filter((p) => p.onScreen && p.status === "approved");
export const getPhoto = (id: string) => PHOTOS.find((p) => p.id === id) ?? null;
export const getPendingPhotos = () => PHOTOS.filter((p) => p.status === "pending");

export const dayLabel = (day: Day, locale: string) => {
  const map: Record<string, Record<Day, string>> = {
    es: { VIE: "Viernes", SÁB: "Sábado" },
    en: { VIE: "Friday", SÁB: "Saturday" },
    ca: { VIE: "Divendres", SÁB: "Dissabte" },
  };
  return (map[locale] ?? map.es)[day];
};
