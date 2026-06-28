import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/content/PageHeader";
import { UploadForm } from "./upload-form";
import { getStage } from "@/lib/mock-data";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ locale: string; stage: string }>;
}) {
  const { locale, stage: stageId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("upload");

  const stage = getStage(stageId);
  if (!stage) notFound();

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1">
      <PageHeader
        backHref="/escenarios"
        title={t("title")}
        eyebrow={`${stage.name.toUpperCase()} · ${stage.day}`}
      />
      <UploadForm
        stageId={stage.id}
        labels={{
          tabCamera: t("tabCamera"),
          tabGallery: t("tabGallery"),
          emptyCamera: t("emptyCamera"),
          emptyGallery: t("emptyGallery"),
          preview: t("preview"),
          name: t("name"),
          instagram: t("instagram"),
          tiktok: t("tiktok"),
          comment: t("comment"),
          legalRights: t("legalRights"),
          legalAge: t("legalAge"),
          submit: t("submit"),
          submitting: t("submitting"),
        }}
      />
    </main>
  );
}
