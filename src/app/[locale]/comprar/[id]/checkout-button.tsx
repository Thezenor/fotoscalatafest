"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { buttonClass } from "@/components/ui/Button";

export function CheckoutButton({
  photoId,
  kind,
  provider,
  label,
}: {
  photoId: string;
  kind: "download" | "print";
  provider: "stripe" | "paypal";
  label: string;
}) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/print/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, kind, provider, locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "error");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className={buttonClass({
          variant: provider === "stripe" ? "primary" : "secondary",
          size: "md",
          className: "w-full",
        })}
      >
        {loading ? "…" : label}
      </button>
      {error && <span className="text-xs text-danger">No se pudo iniciar el pago ({error}).</span>}
    </div>
  );
}
