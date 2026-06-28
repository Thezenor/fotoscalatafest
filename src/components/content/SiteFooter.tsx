import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { getBranding } from "@/server/services/settings.service";

/** Pie de página público: enlaces, legal, colaboradores y crédito de desarrollo. */
export async function SiteFooter() {
  const t = await getTranslations("footer");
  const branding = await getBranding();
  const year = new Date().getFullYear();

  const colTitle = "mb-3 font-display text-[13px] font-bold uppercase tracking-wide text-white";
  const linkCls = "font-body text-[14px] text-mist transition hover:text-white";

  return (
    <footer className="mt-auto border-t border-surface-2 bg-ink-pure">
      <div className="mx-auto grid max-w-7xl gap-10 px-[22px] py-12 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:px-8">
        {/* Marca */}
        <div>
          <Logo size={34} wordSize={20} />
          <p className="mt-3 max-w-xs font-body text-[14px] leading-relaxed text-mist">{t("tagline")}</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-mist-2">
            3—4 Julio 2026 · Calatayud
          </p>
        </div>

        {/* Explora */}
        <nav>
          <h3 className={colTitle}>{t("links")}</h3>
          <ul className="flex flex-col gap-2.5">
            <li><Link href="/galeria" className={linkCls}>{t("gallery")}</Link></li>
            <li><Link href="/escenarios" className={linkCls}>{t("stages")}</Link></li>
            <li><Link href="/escenarios" className={linkCls}>{t("upload")}</Link></li>
          </ul>
        </nav>

        {/* Legal */}
        <nav>
          <h3 className={colTitle}>{t("legal")}</h3>
          <ul className="flex flex-col gap-2.5">
            <li><Link href="/legal/terms" className={linkCls}>{t("terms")}</Link></li>
            <li><Link href="/legal/privacy" className={linkCls}>{t("privacy")}</Link></li>
          </ul>
          <p className="mt-3 max-w-[220px] font-body text-[12px] leading-snug text-mist-2">{t("removalNote")}</p>
        </nav>

        {/* Colaboradores */}
        <div>
          <h3 className={colTitle}>{t("collaborators")}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {branding.sponsors.map((s) => (
              <span key={s} className="font-body text-[14px] font-semibold text-mist">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-surface-2">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-[22px] py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
          <p className="font-body text-[12.5px] text-mist-2">
            © {year} Calatafest Fotos · {t("organizer")}{" "}
            <span className="text-mist">AYUDFEST S.L.</span> · NIF B72994817 · {t("rights")}
          </p>
          <p className="font-body text-[12.5px] text-mist-2">
            {t("developedBy")}{" "}
            <span className="font-display font-bold uppercase tracking-wide text-brand">Novaura Group LLC</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
