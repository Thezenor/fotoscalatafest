"use client";

import { Check, X, Star, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionLabels {
  approve: string;
  reject: string;
  feature: string;
  sendToScreen: string;
}

/** Fila de 4 acciones de moderación. */
export function ActionBar({
  onApprove,
  onReject,
  onFeature,
  onSendToScreen,
  labels,
}: {
  onApprove: () => void;
  onReject: () => void;
  onFeature: () => void;
  onSendToScreen: () => void;
  labels: ActionLabels;
}) {
  const btn = "flex h-10 flex-1 items-center justify-center rounded-xs transition active:scale-95";
  return (
    <div className="flex gap-2">
      <button type="button" aria-label={labels.approve} onClick={onApprove} className={cn(btn, "bg-success text-success-ink")}>
        <Check className="h-5 w-5" strokeWidth={3} />
      </button>
      <button type="button" aria-label={labels.reject} onClick={onReject} className={cn(btn, "bg-danger/20 text-danger")}>
        <X className="h-5 w-5" strokeWidth={3} />
      </button>
      <button type="button" aria-label={labels.feature} onClick={onFeature} className={cn(btn, "border border-brand text-brand")}>
        <Star className="h-5 w-5" />
      </button>
      <button type="button" aria-label={labels.sendToScreen} onClick={onSendToScreen} className={cn(btn, "bg-brand text-brand-ink")}>
        <MonitorPlay className="h-5 w-5" />
      </button>
    </div>
  );
}
