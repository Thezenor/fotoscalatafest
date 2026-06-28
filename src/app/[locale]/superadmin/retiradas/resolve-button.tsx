"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { resolveRemovalAction } from "@/server/actions/superadmin";
import { buttonClass } from "@/components/ui/Button";

export function ResolveButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => resolveRemovalAction(id))}
      className={buttonClass({ variant: "success", size: "sm", className: "uppercase" })}
    >
      <Check className="h-4 w-4" /> Resolver
    </button>
  );
}
