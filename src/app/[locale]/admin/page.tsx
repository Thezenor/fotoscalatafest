import { Search, MonitorPlay } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { signOut } from "@/auth";
import { requireUser } from "@/server/auth/guards";
import { Sidebar } from "@/components/admin/Sidebar";
import { StatCard } from "@/components/admin/StatCard";
import { AdminModeration } from "@/components/admin/AdminModeration";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { listForModeration } from "@/server/services/photo.service";

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

  const board = await listForModeration();
  const pendingCount = board.filter((p) => p.status === "pending").length;

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
          <h1 className="font-display text-[22px] font-bold uppercase text-white">
            {t("nav.moderation")}
          </h1>
          <Badge tone="brand">
            {pendingCount} {t("inQueue")}
          </Badge>
        </header>

        {/* Stats escritorio */}
        <div className="mb-5 hidden grid-cols-4 gap-4 lg:grid">
          <StatCard label={t("pending")} value={String(pendingCount)} tone="brand" />
          <StatCard label={t("approved")} value="1.248" tone="success" />
          <StatCard label={t("uploadedToday")} value="312" />
          <StatCard label={t("onScreen")} value="8" />
        </div>

        <AdminModeration initial={board} locale={locale} filters={filters} labels={labels} />
      </main>
    </div>
  );
}
