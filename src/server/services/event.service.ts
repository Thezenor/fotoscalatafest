import { prisma } from "@/server/db";

/** Evento activo por slug, con sus escenarios ordenados. */
export async function getActiveEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: { slug, isActive: true },
    include: {
      stages: { orderBy: { order: "asc" } },
    },
  });
}

/** Comprueba que el token corresponde al QR de acceso del evento activo. */
export async function isValidAccessToken(slug: string, token: string | null) {
  if (!token) return false;
  const event = await prisma.event.findFirst({
    where: { slug, isActive: true },
    select: { accessQrToken: true },
  });
  return !!event && event.accessQrToken === token;
}
