"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Uploader, type UploaderLabels } from "@/components/content/Uploader";
import { Input, Textarea } from "@/components/ui/Input";
import { LegalCheckbox } from "@/components/ui/LegalCheckbox";
import { buttonClass } from "@/components/ui/Button";

export interface UploadLabels extends UploaderLabels {
  name: string;
  instagram: string;
  tiktok: string;
  comment: string;
  legalRights: string;
  legalAge: string;
  submit: string;
  submitting: string;
}

export function UploadForm({
  stageId,
  labels,
}: {
  stageId: string;
  labels: UploadLabels;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [rights, setRights] = useState(false);
  const [age, setAge] = useState(false);
  const [sending, setSending] = useState(false);

  const canSubmit = rights && age && !sending; // foto opcional en demo

  async function submit() {
    setSending(true);
    // TODO(backend): construir FormData con `file` + campos y hacer
    // POST /api/photos (multipart). La foto entra con status "pending".
    // Aquí simulamos el envío y vamos a la confirmación.
    void file;
    void stageId;
    await new Promise((r) => setTimeout(r, 600));
    router.push("/enviada");
  }

  return (
    <div className="flex flex-col gap-4 px-5 pb-32">
      <Uploader labels={labels} onSelect={setFile} />

      <Input name="name" placeholder={labels.name} />
      <div className="grid grid-cols-2 gap-3">
        <Input name="instagram" placeholder={labels.instagram} />
        <Input name="tiktok" placeholder={labels.tiktok} />
      </div>
      <Textarea name="comment" placeholder={labels.comment} />

      <div className="flex flex-col gap-1 pt-1">
        <LegalCheckbox checked={rights} onChange={setRights}>
          {labels.legalRights}
        </LegalCheckbox>
        <LegalCheckbox checked={age} onChange={setAge}>
          {labels.legalAge}
        </LegalCheckbox>
      </div>

      {/* CTA sticky */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] bg-gradient-to-t from-ink via-ink/95 to-transparent px-5 pb-5 pt-8">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className={buttonClass({ className: "w-full uppercase" })}
        >
          {sending ? labels.submitting : labels.submit} <Rocket className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
