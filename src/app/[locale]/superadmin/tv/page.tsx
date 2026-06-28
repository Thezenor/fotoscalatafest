import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { getTvConfig } from "@/server/services/settings.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { TvConfig } from "./tv-config";

export const dynamic = "force-dynamic";

export default async function TvPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const tv = await getTvConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="TV en directo" />
      <p className="mb-6 -mt-2 font-body text-mist">
        Elige la plantilla de la pantalla del recinto, previsualízala en tiempo real y comparte el enlace.
      </p>
      <TvConfig initial={tv} locale={locale} siteUrl={siteUrl} />
    </main>
  );
}
