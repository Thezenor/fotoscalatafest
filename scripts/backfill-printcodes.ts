import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

/**
 * Asigna un printCode único a las fotos que no lo tengan (datos previos).
 * Uso: tsx scripts/backfill-printcodes.ts  (con DATABASE_URL del destino)
 */
const prisma = new PrismaClient();

async function main() {
  const photos = await prisma.photo.findMany({ where: { printCode: null }, select: { id: true } });
  let done = 0;
  for (const p of photos) {
    for (let i = 0; i < 6; i++) {
      const code = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
      try {
        await prisma.photo.update({ where: { id: p.id }, data: { printCode: code } });
        done++;
        break;
      } catch {
        /* colisión: reintenta */
      }
    }
  }
  console.log(`✓ printCode asignado a ${done}/${photos.length} fotos`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
