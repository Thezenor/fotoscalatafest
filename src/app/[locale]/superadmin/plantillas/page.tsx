import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { getTemplates } from "@/server/services/settings.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { PlantillasForm } from "./plantillas-form";

export const dynamic = "force-dynamic";

export default async function PlantillasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const tpl = await getTemplates();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Plantillas de foto" />
      <PlantillasForm vertical={tpl.vertical} horizontal={tpl.horizontal} />
    </main>
  );
}
