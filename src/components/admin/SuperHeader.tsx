import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";

/** Cabecera de subpágina de superadmin: volver + título. */
export function SuperHeader({ title }: { title: string }) {
  return (
    <header className="mb-6 flex items-center gap-3">
      <Link
        href="/superadmin"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-white"
        aria-label="back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="font-display text-2xl font-bold uppercase text-white lg:text-3xl">
        {title}
      </h1>
      <Badge tone="brand" className="ml-auto">
        SUPERADMIN
      </Badge>
    </header>
  );
}
