import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicPhoto } from "@/server/services/photo.service";
import { getPrintConfig, getPayments } from "@/server/services/settings.service";
import { availableProviders } from "@/server/services/payments.service";
import { CheckoutButton } from "./checkout-button";

export const dynamic = "force-dynamic";

function price(cents: number, currency: string) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}

export default async function BuyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");
  const photo = await getPublicPhoto(id);
  if (!photo) notFound();

  const [cfg, pay, providers] = await Promise.all([
    getPrintConfig(),
    getPayments(),
    availableProviders(),
  ]);

  const items = [
    { kind: "download" as const, on: cfg.downloadEnabled, cents: cfg.downloadPriceCents, title: t("downloadTitle"), desc: t("downloadDesc") },
    { kind: "print" as const, on: cfg.printEnabled, cents: cfg.printPriceCents, title: t("printTitle"), desc: t("printDesc") },
  ].filter((i) => i.on);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <Link href={`/foto/${id}`} className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="overflow-hidden rounded-lg border border-line">
        <Image src={photo.url} alt={photo.stageName} width={photo.width} height={photo.height} sizes="480px" className="h-auto w-full" />
      </div>

      <h1 className="mt-5 font-display text-2xl font-bold uppercase text-white">{t("title")}</h1>

      {items.length === 0 ? (
        <p className="mt-3 rounded-md border border-line bg-surface p-4 font-body text-sm text-mist">
          {t("saleOff")}
        </p>
      ) : providers.length === 0 ? (
        <p className="mt-3 rounded-md border border-line bg-surface p-4 font-body text-sm text-mist">
          {t("noGateway")}
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          {items.map((it) => (
            <section key={it.kind} className="rounded-[16px] border border-line bg-surface p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-bold text-white">{it.title}</h2>
                <span className="font-display text-xl font-bold text-brand">{price(it.cents, pay.currency)}</span>
              </div>
              <p className="mt-1 font-body text-sm text-mist">{it.desc}</p>
              <div className="mt-4 flex flex-col gap-2">
                {providers.includes("stripe") && (
                  <CheckoutButton photoId={id} kind={it.kind} provider="stripe" label={t("payCard")} errorLabel={t("payError")} />
                )}
                {providers.includes("paypal") && (
                  <CheckoutButton photoId={id} kind={it.kind} provider="paypal" label={t("payPaypal")} errorLabel={t("payError")} />
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
