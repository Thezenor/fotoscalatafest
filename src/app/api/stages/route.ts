import { NextResponse } from "next/server";
import { getStages } from "@/lib/mock-data";

// GET /api/stages → escenarios del evento.
// TODO(backend): leer de Prisma (Stage) en lugar del mock.
export async function GET() {
  return NextResponse.json({ stages: getStages() });
}
