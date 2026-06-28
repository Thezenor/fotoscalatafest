import {
  ImageIcon,
  CalendarDays,
  Users,
  Download,
  ScrollText,
  FileWarning,
  Palette,
  Bot,
  FileText,
  LayoutTemplate,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/auth";
import { requireRole } from "@/server/auth/guards";
import { countOpenRemovals } from "@/server/services/admin.service";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function SuperadminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireRole("SUPERADMIN");
  const t = await getTranslations("superadmin");
  const tAuth = await getTranslations("auth");
  const openRemovals = await countOpenRemovals();

  const cards = [
    { key: "moderation", icon: ImageIcon, href: "/admin", ready: true, external: false, badge: 0 },
    { key: "events", icon: CalendarDays, href: "/superadmin/eventos", ready: true, external: false, badge: 0 },
    { key: "users", icon: Users, href: "/superadmin/usuarios", ready: true, external: false, badge: 0 },
    { key: "removals", icon: FileWarning, href: "/superadmin/retiradas", ready: true, external: false, badge: openRemovals },
    { key: "branding", icon: Palette, href: "/superadmin/branding", ready: true, external: false, badge: 0 },
    { key: "ia", icon: Bot, href: "/superadmin/ia", ready: true, external: false, badge: 0 },
    { key: "templates", icon: LayoutTemplate, href: "/superadmin/plantillas", ready: true, external: false, badge: 0 },
    { key: "payments", icon: CreditCard, href: "/superadmin/pagos", ready: true, external: false, badge: 0 },
    { key: "terms", icon: FileText, href: "/superadmin/terminos", ready: true, external: false, badge: 0 },
    { key: "export", icon: Download, href: "/api/superadmin/export", ready: true, external: true, badge: 0 },
    { key: "audit", icon: ScrollText, href: "/superadmin/auditoria", ready: true, external: false, badge: 0 },
  ] as const;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8 lg:py-12">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Inicio">
            <Logo size={30} wordSize={18} />
          </Link>
          <Badge tone="brand">SUPERADMIN</Badge>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-pill border border-line px-4 py-2 font-body text-sm text-white"
          >
            {tAuth("signOut")}
          </button>
        </form>
      </header>

      <h1 className="font-display text-3xl font-bold uppercase text-white lg:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-1 font-body text-mist">
        {t("welcome", { name: user.name ?? user.email ?? "" })}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, icon: Icon, href, ready, external, badge }) => {
          const inner = (
            <div
              className={`flex h-full flex-col gap-3 rounded-[16px] border border-line bg-surface p-5 transition ${
                ready ? "hover:border-brand" : "opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-7 w-7 text-brand" />
                {badge > 0 ? (
                  <Badge tone="danger">{badge}</Badge>
                ) : ready ? (
                  <ArrowRight className="h-5 w-5 text-mist" />
                ) : (
                  <Badge tone="neutral">{t("soon")}</Badge>
                )}
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white">{t(key)}</h2>
                <p className="mt-1 font-body text-sm text-mist">{t(`${key}Desc`)}</p>
              </div>
            </div>
          );
          if (external) {
            return (
              <a key={key} href={href} download>
                {inner}
              </a>
            );
          }
          return (
            <Link key={key} href={href}>
              {inner}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
