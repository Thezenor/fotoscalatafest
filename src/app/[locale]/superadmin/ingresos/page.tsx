import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { getRevenueStats } from "@/server/services/admin.service";
import { getPayments } from "@/server/services/settings.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = { download: "Descarga", print: "Impresión" };

export default async function IngresosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const [stats, pay] = await Promise.all([getRevenueStats(), getPayments()]);

  const money = (cents: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: pay.currency || "EUR" }).format(cents / 100);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Ingresos" />
      <p className="mb-6 -mt-2 font-body text-mist">
        Ventas de descargas tratadas e impresiones en sitio (pedidos pagados y entregados).
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Ingresos totales" value={money(stats.totalCents)} tone="brand" />
        <StatCard label="Hoy" value={money(stats.todayCents)} tone="success" />
        <StatCard label="Pedidos pagados" value={String(stats.count)} />
        <StatCard label="Ticket medio" value={money(stats.avgCents)} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Por tipo */}
        <div className="rounded-[16px] border border-line bg-surface p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-white">Por tipo</h2>
          {stats.byKind.length === 0 ? (
            <p className="font-body text-sm text-mist">Sin ventas todavía.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.byKind.map((k) => (
                <li key={k.kind} className="flex items-center justify-between font-body text-sm">
                  <span className="text-white">{KIND_LABEL[k.kind] ?? k.kind} · {k.count}</span>
                  <span className="font-display font-bold text-brand">{money(k.cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Por pasarela */}
        <div className="rounded-[16px] border border-line bg-surface p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-white">Por pasarela</h2>
          {stats.byProvider.length === 0 ? (
            <p className="font-body text-sm text-mist">Sin ventas todavía.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.byProvider.map((p) => (
                <li key={p.provider} className="flex items-center justify-between font-body text-sm">
                  <span className="text-white">{p.provider} · {p.count}</span>
                  <span className="font-display font-bold text-brand">{money(p.cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="mt-6 rounded-[16px] border border-line bg-surface p-5">
        <h2 className="mb-3 font-display text-lg font-bold text-white">Pedidos recientes</h2>
        {stats.recent.length === 0 ? (
          <p className="font-body text-sm text-mist">Aún no hay pedidos pagados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left font-body text-sm">
              <thead>
                <tr className="font-mono text-[11px] uppercase tracking-wide text-mist">
                  <th className="py-2">Fecha</th>
                  <th>Foto</th>
                  <th>Tipo</th>
                  <th>Pasarela</th>
                  <th>Estado</th>
                  <th className="text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="py-2 text-mist">
                      {o.paidAt ? new Date(o.paidAt).toLocaleString(locale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="font-mono text-brand">{o.printCode ? `#${o.printCode}` : "—"}</td>
                    <td className="text-white">{KIND_LABEL[o.kind] ?? o.kind}</td>
                    <td className="text-white">{o.provider}</td>
                    <td>
                      <Badge tone={o.status === "FULFILLED" ? "success" : "brand"}>{o.status}</Badge>
                    </td>
                    <td className="text-right font-display font-bold text-white">{money(o.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
