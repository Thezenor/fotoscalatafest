import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { listAuditLogs, listAuditActions } from "@/server/services/admin.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const { action } = await searchParams;

  const [logs, actions] = await Promise.all([
    listAuditLogs({ action }),
    listAuditActions(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Auditoría" />

      {/* Filtros por acción */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        <FilterLink label="Todas" href="/superadmin/auditoria" active={!action} />
        {actions.map((a) => (
          <FilterLink
            key={a}
            label={a}
            href={`/superadmin/auditoria?action=${a}`}
            active={action === a}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-[16px] border border-line">
        <table className="w-full text-left">
          <thead className="bg-surface-2 font-mono text-[11px] uppercase tracking-wide text-mist">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Acción</th>
              <th className="p-3">Entidad</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center font-body text-sm text-mist">
                  Sin registros.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="border-t border-line bg-surface align-top">
                  <td className="whitespace-nowrap p-3 font-mono text-xs text-mist">
                    {l.createdAt.toLocaleString(locale)}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[11px] font-bold uppercase text-brand">
                      {l.action}
                    </span>
                  </td>
                  <td className="p-3 font-body text-xs text-white">
                    {l.entityType}
                    {l.entityId ? <span className="text-mist"> · {l.entityId.slice(0, 8)}</span> : null}
                  </td>
                  <td className="p-3 font-body text-xs text-mist">{l.user?.email ?? "—"}</td>
                  <td className="p-3 font-mono text-xs text-mist">{l.ip ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-pill border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide transition",
        active ? "border-brand bg-brand text-brand-ink" : "border-line text-mist hover:text-white",
      )}
    >
      {label}
    </Link>
  );
}
