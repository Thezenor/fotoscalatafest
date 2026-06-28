import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveEventBySlug } from "@/server/services/event.service";
import { getAccessToken } from "@/lib/access";

// Usa cookies de acceso → render dinámico.
export const dynamic = "force-dynamic";

export default async function EventLanding({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; eventSlug: string }>;
  searchParams: Promise<{ denied?: string }>;
}) {
  const { locale, eventSlug } = await params;
  setRequestLocale(locale);
  const { denied } = await searchParams;
  const t = await getTranslations("event");

  const event = await getActiveEventBySlug(eventSlug);

  // Evento inexistente o inactivo.
  if (!event) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="text-muted-foreground">{t("inactive")}</p>
      </main>
    );
  }

  // Gate de acceso: requiere cookie con el token del QR.
  const token = await getAccessToken(eventSlug);
  const hasAccess = token === event.accessQrToken;
  if (!hasAccess) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
          {denied ? t("accessDenied") : t("scanToAccess")}
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10">
      <header className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Calatafest
        </span>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
          {event.name}
        </h1>
        {event.description && (
          <p className="mt-2 text-balance text-muted-foreground">
            {event.description}
          </p>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{t("chooseStage")}</h2>
        {event.stages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noStages")}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {event.stages.map((stage) => (
              <li key={stage.id}>
                <Link
                  href={`/e/${event.slug}/c/${stage.slug}`}
                  className="group flex h-32 items-end overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:border-primary"
                  style={
                    stage.bannerUrl
                      ? {
                          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1)), url(${stage.bannerUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  <span className="text-lg font-bold text-foreground drop-shadow">
                    {stage.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
