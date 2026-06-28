import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { getAiSettings } from "@/server/services/settings.service";
import { isAiReady } from "@/server/services/ai-moderation.service";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { AiForm } from "./ai-form";

export const dynamic = "force-dynamic";

export default async function AiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");
  const [ai, ready] = await Promise.all([getAiSettings(), isAiReady()]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Moderación con IA" />
      <AiForm enabled={ai.enabled} hasCredentials={!!ai.googleCredentials} ready={ready} />
    </main>
  );
}
