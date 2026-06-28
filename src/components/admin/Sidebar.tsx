import {
  LayoutDashboard,
  ImageIcon,
  Star,
  MonitorPlay,
  Tent,
  Settings,
  Home,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export interface SidebarLabels {
  dashboard: string;
  moderation: string;
  featured: string;
  live: string;
  stages: string;
  settings: string;
}

/** Sidebar admin (escritorio). El item activo va en amarillo. */
export function Sidebar({
  labels,
  user,
  pendingCount,
  active = "moderation",
  superadmin = false,
}: {
  labels: SidebarLabels;
  user: string;
  pendingCount: number;
  active?: keyof SidebarLabels;
  superadmin?: boolean;
}) {
  const items: {
    key: keyof SidebarLabels;
    icon: React.ReactNode;
    href: string | null;
    badge?: number;
  }[] = [
    { key: "dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, href: superadmin ? "/superadmin" : null },
    { key: "moderation", icon: <ImageIcon className="h-[18px] w-[18px]" />, href: "/admin", badge: pendingCount },
    { key: "featured", icon: <Star className="h-[18px] w-[18px]" />, href: null },
    { key: "live", icon: <MonitorPlay className="h-[18px] w-[18px]" />, href: "/live" },
    { key: "stages", icon: <Tent className="h-[18px] w-[18px]" />, href: superadmin ? "/superadmin/eventos" : null },
    { key: "settings", icon: <Settings className="h-[18px] w-[18px]" />, href: superadmin ? "/superadmin/eventos" : null },
  ];

  return (
    <aside className="hidden w-[230px] shrink-0 flex-col border-r border-surface-2 bg-surface lg:flex">
      <Link href="/" className="px-5 py-5">
        <Logo size={26} wordSize={16} word="FOTOS·ADMIN" />
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((it) => {
          const isActive = it.key === active;
          const cls = cn(
            "flex items-center justify-between rounded-sm px-3 py-2.5 font-body text-[14px] font-medium",
            isActive ? "bg-brand text-brand-ink" : "text-mist hover:text-white",
            !it.href && !isActive && "cursor-default opacity-60",
          );
          const content = (
            <>
              <span className="flex items-center gap-2.5">
                {it.icon} {labels[it.key]}
              </span>
              {it.badge ? (
                <span
                  className={cn(
                    "rounded-pill px-1.5 py-0.5 font-mono text-[10px] font-bold",
                    isActive ? "bg-brand-ink/15 text-brand-ink" : "bg-surface-2 text-white",
                  )}
                >
                  {it.badge}
                </span>
              ) : null}
            </>
          );
          return it.href ? (
            <Link key={it.key} href={it.href} className={cls}>
              {content}
            </Link>
          ) : (
            <span key={it.key} className={cls}>
              {content}
            </span>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-surface-2 px-3 py-4">
        {superadmin && (
          <Link
            href="/superadmin"
            className="flex items-center gap-2.5 rounded-sm px-2 py-2 font-body text-[13px] text-white hover:text-brand"
          >
            <LayoutDashboard className="h-4 w-4" /> Menú superadmin
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm px-2 py-2 font-body text-[13px] text-mist hover:text-white"
        >
          <Home className="h-4 w-4" /> Ver sitio
        </Link>
        <div className="mt-1 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-display text-[13px] font-bold">
            {user.charAt(0).toUpperCase()}
          </span>
          <span className="font-body text-[13px] text-mist">{user}</span>
        </div>
      </div>
    </aside>
  );
}
