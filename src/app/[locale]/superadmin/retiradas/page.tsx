import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { listRemovalRequests } from "@/server/services/admin.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/navigation";
import { ResolveButton } from "./resolve-button";

export const dynamic = "force-dynamic";

export default async function RemovalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const requests = await listRemovalRequests();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Solicitudes de retirada" />

      {requests.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-mist">
          No hay solicitudes de retirada.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-[16px] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone={r.status === "OPEN" ? "danger" : "success"}>
                    {r.status === "OPEN" ? "Abierta" : "Resuelta"}
                  </Badge>
                  <span className="font-mono text-xs text-mist">
                    {r.createdAt.toLocaleString(locale)}
                  </span>
                </div>
                <p className="mt-2 font-body text-sm text-white">{r.reason}</p>
                <p className="mt-1 font-body text-xs text-mist">
                  {r.email}
                  {r.photo ? (
                    <>
                      {" · "}
                      <Link href={`/foto/${r.photo.id}`} className="text-brand underline">
                        ver foto ({r.photo.stage?.name ?? "—"})
                      </Link>
                    </>
                  ) : (
                    " · foto eliminada"
                  )}
                </p>
              </div>
              {r.status === "OPEN" && <ResolveButton id={r.id} />}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
