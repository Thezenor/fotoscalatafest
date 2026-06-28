"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updatePaymentsAction, type StoreState } from "@/server/actions/store";
import { Input } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";

export function PagosForm({
  currency,
  stripeEnabled,
  hasStripe,
  paypalEnabled,
  hasPaypal,
  paypalMode,
  downloadEnabled,
  downloadPrice,
  printEnabled,
  printPrice,
}: {
  currency: string;
  stripeEnabled: boolean;
  hasStripe: boolean;
  paypalEnabled: boolean;
  hasPaypal: boolean;
  paypalMode: string;
  downloadEnabled: boolean;
  downloadPrice: string;
  printEnabled: boolean;
  printPrice: string;
}) {
  const [state, action, pending] = useActionState<StoreState, FormData>(updatePaymentsAction, {});

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Precios */}
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-bold text-white">Precios (tienda)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-body text-sm text-white">
            Moneda
            <Input name="currency" defaultValue={currency} className="max-w-[120px]" />
          </label>
          <div />
          <label className="flex items-center gap-3 font-body text-sm text-white">
            <input type="checkbox" name="downloadEnabled" defaultChecked={downloadEnabled} className="h-5 w-5 accent-[var(--brand)]" />
            Vender descarga alta calidad
          </label>
          <label className="flex flex-col gap-1 font-body text-sm text-white">
            Precio descarga (€)
            <Input name="downloadPrice" type="number" step="0.50" defaultValue={downloadPrice} className="max-w-[140px]" />
          </label>
          <label className="flex items-center gap-3 font-body text-sm text-white">
            <input type="checkbox" name="printEnabled" defaultChecked={printEnabled} className="h-5 w-5 accent-[var(--brand)]" />
            Vender impresión en sitio
          </label>
          <label className="flex flex-col gap-1 font-body text-sm text-white">
            Precio impresión (€)
            <Input name="printPrice" type="number" step="0.50" defaultValue={printPrice} className="max-w-[140px]" />
          </label>
        </div>
      </section>

      {/* Stripe */}
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-bold text-white">Stripe</h2>
        <label className="mt-3 flex items-center gap-3 font-body text-sm text-white">
          <input type="checkbox" name="stripeEnabled" defaultChecked={stripeEnabled} className="h-5 w-5 accent-[var(--brand)]" />
          Activar Stripe {hasStripe ? "· (clave guardada)" : ""}
        </label>
        <div className="mt-3 grid gap-3">
          <Input name="stripeSecretKey" placeholder="Secret key (sk_live_… / sk_test_…)" />
          <Input name="stripePublishableKey" placeholder="Publishable key (pk_…)" />
          <Input name="stripeWebhookSecret" placeholder="Webhook signing secret (whsec_…)" />
        </div>
        <p className="mt-2 font-body text-xs text-mist-2">
          Webhook: configura en Stripe el endpoint <code>/api/print/stripe/webhook</code> (evento checkout.session.completed) y pega aquí su signing secret.
        </p>
      </section>

      {/* PayPal */}
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-bold text-white">PayPal</h2>
        <label className="mt-3 flex items-center gap-3 font-body text-sm text-white">
          <input type="checkbox" name="paypalEnabled" defaultChecked={paypalEnabled} className="h-5 w-5 accent-[var(--brand)]" />
          Activar PayPal {hasPaypal ? "· (clave guardada)" : ""}
        </label>
        <div className="mt-3 grid gap-3">
          <Input name="paypalClientId" placeholder="Client ID" />
          <Input name="paypalSecret" placeholder="Secret" />
          <label className="flex items-center justify-between gap-3 font-body text-sm text-white">
            Modo
            <select name="paypalMode" defaultValue={paypalMode} className="rounded-sm border border-line bg-surface-2 px-2 py-1.5 text-sm">
              <option value="sandbox">Sandbox (pruebas)</option>
              <option value="live">Live (real)</option>
            </select>
          </label>
        </div>
      </section>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Guardado ✓</p>}
      <button type="submit" disabled={pending} className={buttonClass({ size: "md", className: "uppercase self-start" })}>
        <Save className="h-5 w-5" /> Guardar pagos
      </button>
    </form>
  );
}
