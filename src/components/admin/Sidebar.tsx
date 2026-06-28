import {
  LayoutDashboard,
  ImageIcon,
  Star,
  MonitorPlay,
  Tent,
  Settings,
} from "lucide-react";
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
}: {
  labels: SidebarLabels;
  user: string;
  pendingCount: number;
  active?: keyof SidebarLabels;
}) {
  const items: { key: keyof SidebarLabels; icon: React.ReactNode; badge?: number }[] = [
    { key: "dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
    { key: "moderation", icon: <ImageIcon className="h-[18px] w-[18px]" />, badge: pendingCount },
    { key: "featured", icon: <Star className="h-[18px] w-[18px]" /> },
    { key: "live", icon: <MonitorPlay className="h-[18px] w-[18px]" /> },
    { key: "stages", icon: <Tent className="h-[18px] w-[18px]" /> },
    { key: "settings", icon: <Settings className="h-[18px] w-[18px]" /> },
  ];

  return (
    <aside className="hidden w-[230px] shrink-0 flex-col border-r border-surface-2 bg-surface lg:flex">
      <div className="px-5 py-5">
        <Logo size={26} wordSize={16} word="FOTOS·ADMIN" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((it) => {
          const isActive = it.key === active;
          return (
            <span
              key={it.key}
              className={cn(
                "flex cursor-default items-center justify-between rounded-sm px-3 py-2.5 font-body text-[14px] font-medium",
                isActive ? "bg-brand text-brand-ink" : "text-mist hover:text-white",
              )}
            >
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
            </span>
          );
        })}
      </nav>
      <div className="flex items-center gap-2 border-t border-surface-2 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-display text-[13px] font-bold">
          {user.charAt(0).toUpperCase()}
        </span>
        <span className="font-body text-[13px] text-mist">{user}</span>
      </div>
    </aside>
  );
}
