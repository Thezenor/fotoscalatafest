import { Search, MonitorPlay, ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/auth";
import { requireUser } from "@/server/auth/guards";
import { Sidebar } from "@/components/admin/Sidebar";
import { StatCard } from "@/components/admin/StatCard";
import { AdminModeration } from "@/components/admin/AdminModeration";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { listForModeration, getActiveEvent } from "@/server/services/photo.service";
import { getModerationStats } from "@/server/services/admin.service";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const t = await getTranslations("admin");
  const tg = await getTranslations("gallery");

  const event = await getActiveEvent();
  const [board, stats] = await Promise.all([
    listForModeration(),
    event ? getModerationStats(event.id) : Promise.resolve({ pending: 0, approved: 0, uploadedToday: 0, onScreen: 0 }),
  ]);
  const pendingCount = stats.pending;

  const filters = [
    { value: "pending", label: t("pending") },
    { value: "all", label: tg("filters.all") },
    { value: "principal", label: "Principal" },
    { value: "electronica", label: "Electrónica" },
    { value: "VIE", label: tg("filters.friday") },
  ];

  const labels = {
    approve: t("approve"),
    reject: t("reject"),
    feature: t("feature"),
    sendToScreen: t("sendToScreen"),
    pending: t("pending"),
    approved: t("approved"),
    rejected: t("reject"),
    featured: t("feature"),
    inQueue: t("inQueue"),
    pendingShort: t("pending"),
    todayOk: t("todayOk"),
    onScreen: t("onScreen"),
    queueEmpty: t("queueEmpty"),
    undo: t("undo"),
    toastApproved: t("toastApproved"),
    toastRejected: t("toastRejected"),
    toastFeatured: t("toastFeatured"),
    toastOnScreen: t("toastOnScreen"),
  };

  return (
    <div className="flex min-h-dvh w-full bg-ink">
      <Sidebar
        active="moderation"
        pendingCount={pendingCount}
        superadmin={user.role === "SUPERADMIN"}
        user={user.name ?? user.email ?? "Moderador"}
        labels={{
          dashboard: t("nav.dashboard"),
          moderation: t("nav.moderation"),
          featured: t("nav.featured"),
          live: t("nav.live"),
          stages: t("nav.stages"),
          settings: t("nav.settings"),
        }}
      />

      <main className="min-w-0 flex-1 px-5 py-5 lg:px-7 lg:py-6">
        {/* Header escritorio */}
        <header className="mb-5 hidden items-center justify-between lg:flex">
          <div>
            <h1 className="font-display text-[26px] font-bold text-white">{t("moderation")}</h1>
            <p className="font-body text-[13px] text-mist">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={buttonClass({ variant: "secondary", size: "sm", className: "cursor-default normal-case" })}>
              <Search className="h-4 w-4" /> {t("search")}
            </span>
            <span className={buttonClass({ size: "sm", className: "cursor-default" })}>
              <MonitorPlay className="h-4 w-4" /> {t("sendSelection")}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button className={buttonClass({ variant: "secondary", size: "sm" })} type="submit">
                {/* cerrar sesión */}✕
              </button>
            </form>
          </div>
        </header>

        {/* Header móvil */}
        <header className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <Link
              href={user.role === "SUPERADMIN" ? "/superadmin" : "/"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-white"
              aria-label="volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display text-[22px] font-bold uppercase text-white">
              {t("nav.moderation")}
            </h1>
          </div>
          <Badge tone="brand">
            {pendingCount} {t("inQueue")}
          </Badge>
        </header>

        {/* Stats escritorio */}
        <div className="mb-5 hidden grid-cols-4 gap-4 lg:grid">
          <StatCard label={t("pending")} value={String(stats.pending)} tone="brand" />
          <StatCard label={t("approved")} value={String(stats.approved)} tone="success" />
          <StatCard label={t("uploadedToday")} value={String(stats.uploadedToday)} />
          <StatCard label={t("onScreen")} value={String(stats.onScreen)} />
        </div>

        <AdminModeration initial={board} locale={locale} filters={filters} labels={labels} stats={stats} />
      </main>
    </div>
  );
}
