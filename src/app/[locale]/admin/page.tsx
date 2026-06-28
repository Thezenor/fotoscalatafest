import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/server/auth/guards";
import { signOut } from "@/auth";

// Usa la sesión (cookies) → render dinámico, no se prerenderiza.
export const dynamic = "force-dynamic";

export default async function AdminHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const t = await getTranslations("admin");
  const tAuth = await getTranslations("auth");

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("welcome", { name: user.name ?? user.email ?? "" })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("role", { role: user.role })}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            {tAuth("signOut")}
          </button>
        </form>
      </header>

      <p className="text-sm text-muted-foreground">
        La cola de moderación se implementará en la Fase 5.
      </p>
    </main>
  );
}
