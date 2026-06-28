import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Crea o actualiza un usuario SUPERADMIN con la contraseña indicada.
 * Uso:  SUPERADMIN_EMAIL=... SUPERADMIN_NEW_PASSWORD=... tsx scripts/set-superadmin.ts
 */
const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SUPERADMIN_EMAIL ?? "lopez@karaokemedia.com").toLowerCase();
  const password = process.env.SUPERADMIN_NEW_PASSWORD;
  if (!password) {
    console.error("Falta SUPERADMIN_NEW_PASSWORD");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.SUPERADMIN, isActive: true },
    create: { email, name: "Superadmin", role: Role.SUPERADMIN, passwordHash },
  });
  console.log(`✓ SUPERADMIN listo: ${user.email} (rol ${user.role})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
