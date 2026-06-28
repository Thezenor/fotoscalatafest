import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_SUPERADMIN_EMAIL ?? "lopez@karaokemedia.com";
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? "changeme-now";

  // Superadmin inicial
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Superadmin",
      role: Role.SUPERADMIN,
      passwordHash,
    },
  });
  console.log(`✓ Superadmin asegurado: ${email}`);

  // Evento de ejemplo con escenarios
  const event = await prisma.event.upsert({
    where: { slug: "calatafest-2026" },
    update: {},
    create: {
      slug: "calatafest-2026",
      name: "Calatafest 2026",
      description: "Edición 2026 del festival.",
      isActive: true,
      stages: {
        create: [
          { name: "Escenario Principal", slug: "principal", order: 0 },
          { name: "Escenario Furor", slug: "furor", order: 1 },
          { name: "Zona Chill", slug: "chill", order: 2 },
        ],
      },
    },
  });
  console.log(`✓ Evento de ejemplo: ${event.slug} (QR token: ${event.accessQrToken})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
