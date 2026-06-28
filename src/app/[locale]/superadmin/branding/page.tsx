import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { getBranding } from "@/server/services/settings.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { BrandingForm } from "./branding-form";

export const dynamic = "force-dynamic";

export default async function BrandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const branding = await getBranding();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Marca y logos" />
      <BrandingForm showWordmark={branding.showWordmark} sponsors={branding.sponsors} />
    </main>
  );
}
