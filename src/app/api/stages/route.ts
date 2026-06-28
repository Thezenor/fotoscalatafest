import { NextResponse } from "next/server";
import { listStages } from "@/server/services/photo.service";

// GET /api/stages → escenarios del evento activo (Prisma).
export async function GET() {
  return NextResponse.json({ stages: await listStages() });
}
