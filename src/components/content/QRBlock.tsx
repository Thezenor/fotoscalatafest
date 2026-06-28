"use client";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

/**
 * Bloque QR (cuadrado blanco). Tamaños: 78px (foto individual), 118px (Live).
 * El QR de Live apunta a la landing; el de foto a su URL de descarga.
 */
export function QRBlock({
  value,
  size = 78,
  title,
  caption,
  variant = "card",
}: {
  value: string;
  size?: number;
  title: string;
  caption: string;
  variant?: "card" | "plain";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        variant === "card" && "rounded-md border border-line bg-surface p-4",
      )}
    >
      <div className="shrink-0 rounded-[10px] bg-white p-2">
        <QRCodeSVG value={value} size={size} bgColor="#ffffff" fgColor="#0E0E0E" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-[16px] font-bold leading-tight text-white">
          {title}
        </p>
        <p className="font-body text-[13px] leading-snug text-mist">{caption}</p>
      </div>
    </div>
  );
}
