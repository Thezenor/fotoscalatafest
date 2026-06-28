import { Camera, Images, Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { LangSwitcher } from "@/components/content/LangSwitcher";
import { cn } from "@/lib/utils";

/**
 * Barra de navegación horizontal SOLO escritorio (lg+). Incluye el acceso al
 * panel (arriba). `floating` la superpone sobre el hero (transparente).
 */
export async function SiteNav({ floating = false }: { floating?: boolean }) {
  const tc = await getTranslations("common");
  const ts = await getTranslations("superadmin");

  return (
    <header
      className={cn(
        "z-40 hidden lg:block",
        floating
          ? "absolute inset-x-0 top-0"
          : "sticky top-0 border-b border-line bg-ink/85 backdrop-blur",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <Link href="/">
          <Logo size={30} wordSize={20} />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/galeria"
            className="flex items-center gap-2 font-display text-[15px] font-semibold text-white transition hover:text-brand"
          >
            <Images className="h-4 w-4" /> {tc("viewGallery")}
          </Link>
          <Link
            href="/escenarios"
            className="flex items-center gap-2 rounded-pill bg-brand px-4 py-2 font-display text-[15px] font-bold uppercase text-brand-ink transition hover:brightness-110"
          >
            <Camera className="h-4 w-4" /> {tc("uploadPhoto")}
          </Link>
          <Link
            href="/superadmin"
            aria-label={ts("openPanel")}
            title={ts("openPanel")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-mist transition hover:border-brand hover:text-brand"
          >
            <Lock className="h-4 w-4" />
          </Link>
          <LangSwitcher tone="solid" />
        </nav>
      </div>
    </header>
  );
}
