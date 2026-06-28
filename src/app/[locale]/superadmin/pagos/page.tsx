import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { getPayments, getPrintConfig } from "@/server/services/settings.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { PagosForm } from "./pagos-form";

export const dynamic = "force-dynamic";

export default async function PagosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const [pay, cfg] = await Promise.all([getPayments(), getPrintConfig()]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Pagos y precios" />
      <PagosForm
        currency={pay.currency}
        stripeEnabled={pay.stripeEnabled}
        hasStripe={!!pay.stripeSecretKey}
        paypalEnabled={pay.paypalEnabled}
        hasPaypal={!!pay.paypalSecret}
        paypalMode={pay.paypalMode}
        downloadEnabled={cfg.downloadEnabled}
        downloadPrice={(cfg.downloadPriceCents / 100).toFixed(2)}
        printEnabled={cfg.printEnabled}
        printPrice={(cfg.printPriceCents / 100).toFixed(2)}
      />
    </main>
  );
}
