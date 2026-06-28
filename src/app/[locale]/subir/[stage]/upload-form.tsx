"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
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
  readTerms: string;
  error: string;
  hint: string;
  notifyEmail: string;
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
  const [error, setError] = useState(false);
  const [fields, setFields] = useState({ name: "", instagram: "", tiktok: "", comment: "", notifyEmail: "" });

  const canSubmit = rights && age && !!file && !sending;

  async function submit() {
    if (!file) return;
    setSending(true);
    setError(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("stage", stageId);
      fd.append("acceptRights", String(rights));
      fd.append("acceptAge", String(age));
      fd.append("name", fields.name);
      fd.append("instagram", fields.instagram);
      fd.append("tiktok", fields.tiktok);
      fd.append("comment", fields.comment);
      fd.append("notifyEmail", fields.notifyEmail);
      const res = await fetch("/api/photos", { method: "POST", body: fd });
      if (!res.ok) throw new Error("upload_failed");
      const data = await res.json().catch(() => ({}));
      // Guarda la foto en "mis fotos" (en el dispositivo) para volver a verla.
      if (data?.id) {
        try {
          const key = "cf_my_photos";
          const prev: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
          if (!prev.includes(data.id)) prev.unshift(data.id);
          localStorage.setItem(key, JSON.stringify(prev.slice(0, 200)));
        } catch {
          /* almacenamiento no disponible */
        }
      }
      router.push("/enviada");
    } catch {
      setError(true);
      setSending(false);
    }
  }

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="flex flex-col gap-4 px-5 pb-32">
      <Uploader labels={labels} onSelect={setFile} />

      <Input name="name" placeholder={labels.name} value={fields.name} onChange={set("name")} />
      <div className="grid grid-cols-2 gap-3">
        <Input name="instagram" placeholder={labels.instagram} value={fields.instagram} onChange={set("instagram")} />
        <Input name="tiktok" placeholder={labels.tiktok} value={fields.tiktok} onChange={set("tiktok")} />
      </div>
      <Textarea name="comment" placeholder={labels.comment} value={fields.comment} onChange={set("comment")} />
      <Input
        name="notifyEmail"
        type="email"
        placeholder={labels.notifyEmail}
        value={fields.notifyEmail}
        onChange={set("notifyEmail")}
      />

      <div className="flex flex-col gap-1 pt-1">
        <LegalCheckbox checked={rights} onChange={setRights}>
          {labels.legalRights}
        </LegalCheckbox>
        <LegalCheckbox checked={age} onChange={setAge}>
          {labels.legalAge}
        </LegalCheckbox>
        <Link
          href="/legal/terms"
          target="_blank"
          className="ml-9 mt-1 inline-block font-body text-[12px] text-accent underline underline-offset-2"
        >
          {labels.readTerms}
        </Link>
      </div>

      {error && (
        <p className="text-center font-body text-[13px] text-danger">{labels.error}</p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] bg-gradient-to-t from-ink via-ink/95 to-transparent px-5 pb-5 pt-8">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className={buttonClass({ className: "w-full uppercase" })}
        >
          {sending ? labels.submitting : labels.submit} <Rocket className="h-5 w-5" />
        </button>
        {!canSubmit && !sending && (
          <p className="mt-2 text-center font-body text-[12px] text-mist">{labels.hint}</p>
        )}
      </div>
    </div>
  );
}
