"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

interface Labels {
  email: string;
  password: string;
  signIn: string;
  invalid: string;
  error: string;
}

export function LoginForm({
  callbackUrl,
  labels,
}: {
  callbackUrl: string;
  labels: Labels;
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{labels.email}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{labels.password}</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      {state.error && (
        <p className="text-sm text-destructive">
          {state.error === "invalid" ? labels.invalid : labels.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition disabled:opacity-60"
      >
        {labels.signIn}
      </button>
    </form>
  );
}
