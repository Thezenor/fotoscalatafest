import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Cabecera de pantalla interior: botón atrás circular + título/eyebrow. */
export function PageHeader({
  backHref,
  title,
  subtitle,
  eyebrow,
  right,
}: {
  backHref: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 px-5 py-4">
      <Link
        href={backHref}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-white"
        aria-label="back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[22px] font-bold uppercase leading-none text-white">
          {title}
        </h1>
        {subtitle && <p className="font-body text-[13px] text-mist">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
