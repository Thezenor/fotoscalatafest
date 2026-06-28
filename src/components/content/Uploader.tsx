"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon, X } from "lucide-react";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";

export interface UploaderLabels {
  tabCamera: string;
  tabGallery: string;
  emptyCamera: string;
  emptyGallery: string;
  preview: string;
}

/**
 * Selector de foto: Cámara (input capture) / Galería (input file).
 * onSelect entrega el File; el preview se genera con URL.createObjectURL.
 * TODO(backend): al enviar, subir el File al storage real (presigned/UploadThing).
 */
export function Uploader({
  labels,
  onSelect,
}: {
  labels: UploaderLabels;
  onSelect: (file: File | null) => void;
}) {
  const [tab, setTab] = useState("camera");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    onSelect(file);
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    onSelect(null);
  }

  function open() {
    (tab === "camera" ? camRef : galRef).current?.click();
  }

  return (
    <div className="flex flex-col gap-3">
      <SegmentedTabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "camera", label: labels.tabCamera, icon: <Camera className="h-4 w-4" /> },
          { value: "gallery", label: labels.tabGallery, icon: <ImageIcon className="h-4 w-4" /> },
        ]}
      />

      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
      <input ref={galRef} type="file" accept="image/*" hidden onChange={handleFile} />

      {preview ? (
        <div className="relative h-[300px] overflow-hidden rounded-md border-[1.5px] border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={labels.preview} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
            aria-label="quitar"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 font-body text-[12px] text-white">
            {labels.preview} · {fileName}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={open}
          className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-md border-[1.5px] border-dashed border-[#3a3a3a] text-mist transition hover:border-brand/60"
        >
          {tab === "camera" ? (
            <Camera className="h-12 w-12 text-brand" />
          ) : (
            <ImageIcon className="h-12 w-12 text-brand" />
          )}
          <span className="font-body text-[15px]">
            {tab === "camera" ? labels.emptyCamera : labels.emptyGallery}
          </span>
        </button>
      )}
    </div>
  );
}
