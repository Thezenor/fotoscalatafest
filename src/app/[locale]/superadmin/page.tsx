import {
  ImageIcon,
  CalendarDays,
  Users,
  Download,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/auth";
import { requireRole } from "@/server/auth/guards";
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

  const cards = [
    { key: "moderation", icon: ImageIcon, href: "/admin", ready: true },
    { key: "events", icon: CalendarDays, href: null, ready: false },
    { key: "users", icon: Users, href: null, ready: false },
    { key: "export", icon: Download, href: null, ready: false },
    { key: "audit", icon: ScrollText, href: null, ready: false },
  ] as const;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8 lg:py-12">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={30} wordSize={18} />
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
        {cards.map(({ key, icon: Icon, href, ready }) => {
          const inner = (
            <div
              className={`flex h-full flex-col gap-3 rounded-[16px] border border-line bg-surface p-5 transition ${
                ready ? "hover:border-brand" : "opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-7 w-7 text-brand" />
                {ready ? (
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
          return href ? (
            <Link key={key} href={href}>
              {inner}
            </Link>
          ) : (
            <div key={key}>{inner}</div>
          );
        })}
      </div>
    </main>
  );
}
