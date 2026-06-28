import "dotenv/config";
import { PrismaClient, Role, PhotoStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const STAGES = [
  { slug: "principal", name: "Escenario Principal", sub: "HEADLINERS", dayLabel: "VIE · SÁB", bannerUrl: "/demo/p01.png", order: 0 },
  { slug: "ambar", name: "Escenario Ámbar", sub: "INDIE & POP", dayLabel: "VIERNES", bannerUrl: "/demo/p15.png", order: 1 },
  { slug: "electronica", name: "Carpa Electrónica", sub: "DJ SETS · LATE NIGHT", dayLabel: "SÁBADO", bannerUrl: "/demo/p03.png", order: 2 },
  { slug: "local", name: "Escenario Local", sub: "BANDAS DE CALATAYUD", dayLabel: "VIERNES", bannerUrl: "/demo/p14.png", order: 3 },
];

interface PhotoSeed {
  file: string;
  stage: string;
  day: "VIE" | "SÁB";
  time: string;
  status: PhotoStatus;
  featured?: boolean;
  onScreen?: boolean;
  authorName?: string;
  authorInstagram?: string;
  w?: number;
  h?: number;
}

const PHOTOS: PhotoSeed[] = [
  { file: "p01.png", stage: "principal", day: "VIE", time: "23:10", status: "APPROVED", featured: true, onScreen: true, authorInstagram: "@laura.m" },
  { file: "p02.png", stage: "electronica", day: "VIE", time: "01:20", status: "APPROVED", onScreen: true, authorInstagram: "@nightowl" },
  { file: "p03.png", stage: "ambar", day: "VIE", time: "22:40", status: "APPROVED", authorName: "Pablo" },
  { file: "p04.png", stage: "local", day: "SÁB", time: "20:05", status: "APPROVED" },
  { file: "p05.png", stage: "electronica", day: "SÁB", time: "02:10", status: "APPROVED", featured: true, authorInstagram: "@crewclt", w: 900, h: 675 },
  { file: "p06.png", stage: "principal", day: "VIE", time: "23:55", status: "APPROVED", onScreen: true },
  { file: "p07.png", stage: "principal", day: "SÁB", time: "21:30", status: "PENDING", authorName: "Sara G." },
  { file: "p08.png", stage: "ambar", day: "VIE", time: "22:00", status: "APPROVED" },
  { file: "p09.png", stage: "electronica", day: "SÁB", time: "01:45", status: "APPROVED", featured: true },
  { file: "p10.png", stage: "principal", day: "VIE", time: "00:15", status: "PENDING", authorInstagram: "@nightowl" },
  { file: "p11.png", stage: "local", day: "VIE", time: "19:40", status: "APPROVED" },
  { file: "p12.png", stage: "ambar", day: "VIE", time: "23:20", status: "PENDING", authorName: "Lucía", w: 900, h: 675 },
  { file: "p13.png", stage: "principal", day: "SÁB", time: "22:50", status: "REJECTED", w: 900, h: 675 },
  { file: "p14.png", stage: "local", day: "SÁB", time: "20:30", status: "APPROVED" },
  { file: "p15.png", stage: "ambar", day: "VIE", time: "21:10", status: "APPROVED", authorName: "Anónimo", w: 900, h: 1350 },
  { file: "p16.png", stage: "electronica", day: "SÁB", time: "03:00", status: "APPROVED", onScreen: true },
  { file: "p17.png", stage: "principal", day: "SÁB", time: "23:42", status: "APPROVED", featured: true, onScreen: true, authorInstagram: "@crewclt" },
];

async function main() {
  const email = process.env.SEED_SUPERADMIN_EMAIL ?? "lopez@karaokemedia.com";
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? "changeme-now";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Superadmin", role: Role.SUPERADMIN, passwordHash },
  });
  console.log(`✓ Superadmin: ${email}`);

  const event = await prisma.event.upsert({
    where: { slug: "calatafest-2026" },
    update: { isActive: true },
    create: {
      slug: "calatafest-2026",
      name: "Calatafest 2026",
      description: "Edición 2026 del festival.",
      isActive: true,
    },
  });
  console.log(`✓ Evento: ${event.slug} (QR token: ${event.accessQrToken})`);

  // Escenarios (upsert por (eventId, slug))
  const stageIds: Record<string, string> = {};
  for (const s of STAGES) {
    const stage = await prisma.stage.upsert({
      where: { eventId_slug: { eventId: event.id, slug: s.slug } },
      update: { name: s.name, sub: s.sub, dayLabel: s.dayLabel, bannerUrl: s.bannerUrl, order: s.order },
      create: { eventId: event.id, slug: s.slug, name: s.name, sub: s.sub, dayLabel: s.dayLabel, bannerUrl: s.bannerUrl, order: s.order },
    });
    stageIds[s.slug] = stage.id;
  }
  console.log(`✓ Escenarios: ${STAGES.map((s) => s.slug).join(", ")}`);

  // Fotos de demo (resembrar limpio)
  await prisma.photo.deleteMany({ where: { eventId: event.id } });
  for (const p of PHOTOS) {
    await prisma.photo.create({
      data: {
        eventId: event.id,
        stageId: stageIds[p.stage],
        status: p.status,
        originalKey: `/demo/${p.file}`, // demo: ruta directa servida por /public
        width: p.w ?? 900,
        height: p.h ?? 600,
        mimeType: "image/png",
        day: p.day,
        timeLabel: p.time,
        featured: p.featured ?? false,
        onScreen: p.onScreen ?? false,
        authorName: p.authorName ?? null,
        authorInstagram: p.authorInstagram ?? null,
        downloadQrToken: p.status === "APPROVED" ? crypto.randomUUID() : null,
      },
    });
  }
  console.log(`✓ Fotos demo sembradas: ${PHOTOS.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
