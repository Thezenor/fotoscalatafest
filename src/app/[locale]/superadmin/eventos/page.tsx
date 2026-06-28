import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { listEvents } from "@/server/services/admin.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { EventConfig, type EventRow } from "./event-config";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const events = await listEvents();

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const rows: EventRow[] = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    name: e.name,
    isActive: e.isActive,
    watermarkEnabled: e.watermarkEnabled,
    watermarkPosition: e.watermarkPosition,
    watermarkOpacity: e.watermarkOpacity,
    autoApproveOnAiClean: e.autoApproveOnAiClean,
    photos: e._count.photos,
    stages: e._count.stages,
    accessUrl: `${site}/api/e/${e.slug}?t=${e.accessQrToken}`,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Eventos" />
      <div className="flex flex-col gap-5">
        {rows.map((e) => (
          <EventConfig key={e.id} event={e} />
        ))}
      </div>
    </main>
  );
}
