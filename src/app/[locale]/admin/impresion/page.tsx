import Image from "next/image";
import { ArrowLeft, Printer, Search } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { requireRole } from "@/server/auth/guards";
import { listPrintQueue, listPrintFulfilled, findPrintByCode } from "@/server/services/admin.service";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { FulfillButton } from "./fulfill-button";

export const dynamic = "force-dynamic";

export default async function PrintStationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("MODERATOR");
  const { code } = await searchParams;

  const [queue, fulfilled, found] = await Promise.all([
    listPrintQueue(),
    listPrintFulfilled(20),
    code ? findPrintByCode(code) : Promise.resolve(null),
  ]);

  // Atajo: si la búsqueda encuentra una copia pagada, ir directo a imprimir.
  if (found && found.order.status === "PAID") {
    redirect({ href: `/admin/impresion/imprimir/${found.order.id}`, locale });
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Printer className="h-6 w-6 text-brand" />
        <h1 className="font-display text-2xl font-bold uppercase text-white">Estación de impresión</h1>
        <Badge tone="brand" className="ml-auto">{queue.length} en cola</Badge>
      </header>

      {/* Buscar por código */}
      <form className="mb-6 flex gap-2" action="">
        <input
          name="code"
          defaultValue={code ?? ""}
          placeholder="Buscar por código (p.ej. CA9933)"
          className="h-12 flex-1 rounded-sm border border-line bg-surface-2 px-4 font-mono uppercase text-white outline-none focus:border-brand"
        />
        <button type="submit" className={buttonClass({ size: "md", className: "uppercase" })}>
          <Search className="h-5 w-5" /> Buscar
        </button>
      </form>

      {code && (
        <section className="mb-8 rounded-[16px] border border-brand bg-surface p-4">
          {found ? (
            <PrintItem
              orderId={found.order.id}
              photoId={found.photo.id}
              codeLabel={found.photo.printCode ?? ""}
              stage={found.photo.stage?.name ?? ""}
              status={found.order.status}
            />
          ) : (
            <p className="font-body text-sm text-mist">No se encontró ninguna copia pagada con el código “{code}”.</p>
          )}
        </section>
      )}

      {/* Cola de impresión */}
      <h2 className="mb-3 font-display text-lg font-bold uppercase text-white">Cola de impresión</h2>
      {queue.length === 0 ? (
        <p className="py-8 text-center font-body text-sm text-mist">No hay copias pendientes de imprimir.</p>
      ) : (
        <div className="grid gap-3">
          {queue.map((o) => (
            <PrintItem
              key={o.id}
              orderId={o.id}
              photoId={o.photo?.id ?? ""}
              codeLabel={o.photo?.printCode ?? ""}
              stage={o.photo?.stage?.name ?? ""}
              status={o.status}
            />
          ))}
        </div>
      )}

      {/* Historial reciente */}
      {fulfilled.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-wide text-mist">
            Impresas recientemente ({fulfilled.length})
          </summary>
          <ul className="mt-3 grid gap-1">
            {fulfilled.map((o) => (
              <li key={o.id} className="font-mono text-xs text-mist-2">
                #{o.photo?.printCode} · {o.photo?.stage?.name}
              </li>
            ))}
          </ul>
        </details>
      )}
    </main>
  );
}

function PrintItem({
  orderId,
  photoId,
  codeLabel,
  stage,
  status,
}: {
  orderId: string;
  photoId: string;
  codeLabel: string;
  stage: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-line bg-surface p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm">
        {photoId && (
          <Image src={`/api/photos/${photoId}/treated?mode=print&order=${orderId}`} alt={codeLabel} fill sizes="64px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold text-brand">#{codeLabel}</p>
        <p className="font-mono text-xs uppercase text-mist">{stage}</p>
        {status === "FULFILLED" && <Badge tone="success">Impresa</Badge>}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Link href={`/admin/impresion/imprimir/${orderId}`} className={buttonClass({ size: "sm", className: "uppercase" })}>
          <Printer className="h-4 w-4" /> Imprimir
        </Link>
        {status === "PAID" && <FulfillButton orderId={orderId} />}
      </div>
    </div>
  );
}
