"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { fulfillPrintAction } from "@/server/actions/moderation";
import { buttonClass } from "@/components/ui/Button";

export function FulfillButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => fulfillPrintAction(orderId).then(() => {}))}
      className={buttonClass({ variant: "success", size: "sm", className: "uppercase" })}
    >
      <Check className="h-4 w-4" /> Marcar impresa
    </button>
  );
}
