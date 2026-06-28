import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { getTerms } from "@/server/services/settings.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { TermsForm } from "./terms-form";

export const dynamic = "force-dynamic";

export default async function TermsAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const terms = await getTerms();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Términos y condiciones" />
      <TermsForm version={terms.version} content={terms.content} />
    </main>
  );
}
