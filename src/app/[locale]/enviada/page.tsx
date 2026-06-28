import Image from "next/image";
import { Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";
import { ShareButton } from "@/components/content/ShareButton";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("confirm");
  const tc = await getTranslations("common");

  return (
    <main className="relative mx-auto flex w-full max-w-[480px] flex-1 flex-col">
      {/* Fondo desenfocado + glow */}
      <Image
        src="/demo/p05.png"
        alt=""
        fill
        sizes="480px"
        className="object-cover opacity-[0.22] blur-md"
      />
      <div className="glow-confirm absolute inset-0" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-7 text-center">
        <div className="flex h-[104px] w-[104px] animate-pop items-center justify-center rounded-full bg-brand shadow-glow">
          <Check className="h-[52px] w-[52px] text-brand-ink" strokeWidth={3.5} />
        </div>
        <h1 className="font-display text-[40px] font-bold uppercase leading-[0.95] text-white">
          {t("title")}
        </h1>
        <p className="max-w-[20rem] font-body text-[16px] text-[#D8D8D8]">
          {t("message")} ✨
        </p>
        <div className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface-2 px-4 py-2">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-brand" />
          <span className="font-body text-[13px] text-white">{t("status")}</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3 p-5">
        <Link href="/galeria" className={buttonClass({ className: "w-full uppercase" })}>
          {tc("viewGallery")}
        </Link>
        <Link href="/" className={buttonClass({ variant: "secondary", className: "w-full uppercase" })}>
          {tc("backHome")}
        </Link>
        <ShareButton label={tc("share")} />
      </div>
    </main>
  );
}
