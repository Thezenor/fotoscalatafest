import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/content/SiteNav";
import { SiteFooter } from "@/components/content/SiteFooter";
import { PageHeader } from "@/components/content/PageHeader";
import { MyPhotos } from "./my-photos";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "myphotos" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function MyPhotosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("myphotos");

  return (
    <main className="w-full flex-1">
      <SiteNav />
      <div className="lg:hidden">
        <PageHeader backHref="/galeria" home title={t("title")} subtitle={t("subtitle")} />
      </div>
      <div className="mx-auto w-full max-w-7xl px-5 pb-10 lg:px-8 lg:pt-8">
        <div className="mb-5 hidden flex-col gap-1 lg:flex">
          <h1 className="font-display text-4xl font-bold uppercase text-white">{t("title")}</h1>
          <p className="font-body text-mist">{t("subtitle")}</p>
        </div>
        <MyPhotos
          labels={{
            empty: t("empty"),
            uploadCta: t("uploadCta"),
            reviewing: t("reviewing"),
            approved: t("approved"),
          }}
        />
      </div>
      <SiteFooter />
    </main>
  );
}
