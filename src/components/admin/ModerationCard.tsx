"use client";

import Image from "next/image";
import { StatusBadge } from "./StatusBadge";
import { ActionBar, type ActionLabels } from "./ActionBar";
import { Badge } from "@/components/ui/Badge";
import { dayLabel, type Photo } from "@/lib/mock-data";

const AI_FLAG = new Set(["NSFW", "VIOLENCE", "MINOR_SUSPECTED", "ERROR"]);

export interface ModerationLabels extends ActionLabels {
  pending: string;
  approved: string;
  rejected: string;
  featured: string;
}

export function ModerationCard({
  photo,
  locale,
  labels,
  onApprove,
  onReject,
  onFeature,
  onSendToScreen,
}: {
  photo: Photo;
  locale: string;
  labels: ModerationLabels;
  onApprove: () => void;
  onReject: () => void;
  onFeature: () => void;
  onSendToScreen: () => void;
}) {
  const author = photo.author?.name ?? photo.author?.instagram ?? "Anónimo";
  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
      <div className="relative h-[150px]">
        <Image src={photo.url} alt={photo.stageName} fill sizes="320px" className="object-cover" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <StatusBadge status={photo.status} featured={photo.featured} labels={labels} />
          {photo.aiVerdict && AI_FLAG.has(photo.aiVerdict) && (
            <Badge tone="danger">IA: {photo.aiVerdict}</Badge>
          )}
        </div>
        {photo.printCode && (
          <span className="absolute right-2 top-2 rounded-pill bg-brand px-2 py-0.5 font-mono text-[10px] font-bold text-brand-ink">
            #{photo.printCode}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="font-body text-[15px] font-semibold text-white">{author}</p>
          <p className="font-mono text-[11px] uppercase tracking-wide text-brand">
            {photo.stageName.replace("Escenario ", "").replace("Carpa ", "")} ·{" "}
            {dayLabel(photo.day, locale)}
          </p>
        </div>
        <ActionBar
          labels={labels}
          onApprove={onApprove}
          onReject={onReject}
          onFeature={onFeature}
          onSendToScreen={onSendToScreen}
        />
      </div>
    </div>
  );
}
