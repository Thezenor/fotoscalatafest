import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { getEmailConfig } from "@/server/services/settings.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { EmailConfig } from "./email-config";

export const dynamic = "force-dynamic";

export default async function EmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const cfg = await getEmailConfig();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Email de avisos" />
      <p className="mb-6 -mt-2 font-body text-mist">
        Avisa al asistente cuando su foto se aprueba (recupera la visita y la compra). Es opcional y solo
        se envía a quien deja su email al subir.
      </p>
      <EmailConfig initial={cfg} />
    </main>
  );
}
