import { NextResponse } from "next/server";
import JSZip from "jszip";
import path from "path";
import { auth } from "@/auth";
import { hasRole } from "@/server/auth/guards";
import { getActiveEvent, } from "@/server/services/photo.service";
import { getExportData } from "@/server/services/admin.service";
import { readAnyObject } from "@/server/services/storage.service";
import { logAudit } from "@/server/services/audit.service";

export const runtime = "nodejs";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

// GET /api/superadmin/export → ZIP con fotos aprobadas + metadata.csv (rol SUPERADMIN).
export async function GET() {
  const session = await auth();
  if (!hasRole(session?.user?.role, "SUPERADMIN")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const event = await getActiveEvent();
  if (!event) return NextResponse.json({ error: "no_active_event" }, { status: 400 });

  const photos = await getExportData(event.id);
  const zip = new JSZip();
  const folder = zip.folder("fotos")!;

  const header = [
    "id", "archivo", "escenario", "dia", "hora", "autor", "instagram",
    "estado", "creada", "consent_version", "consent_ip", "consent_fecha",
  ];
  const rows: string[] = [header.map(csvCell).join(",")];

  for (const p of photos) {
    // Original (alta calidad, sin marca de agua) para el organizador.
    const obj = await readAnyObject(p.originalKey);
    let filename = "";
    if (obj) {
      const ext = path.extname(p.originalKey) || ".jpg";
      filename = `${p.id}${ext}`;
      folder.file(filename, obj.buffer);
    }
    rows.push(
      [
        p.id,
        filename,
        p.stage?.name ?? "",
        p.day ?? "",
        p.timeLabel ?? "",
        p.authorName ?? "",
        p.authorInstagram ?? "",
        p.status,
        p.createdAt.toISOString(),
        p.consent?.termsVersion ?? "",
        p.consent?.ip ?? "",
        p.consent?.acceptedAt?.toISOString() ?? "",
      ].map(csvCell).join(","),
    );
  }

  zip.file("metadata.csv", "﻿" + rows.join("\r\n")); // BOM para Excel
  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  await logAudit({
    action: "EVENT_EXPORT",
    entityType: "Event",
    entityId: event.id,
    userId: session!.user!.id,
    metadata: { photos: photos.length },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${event.slug}-export.zip"`,
    },
  });
}
