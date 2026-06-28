"use client";

import { useActionState } from "react";
import { acceptConsentAction, type ConsentState } from "./actions";

interface Labels {
  rights: string;
  adult: string;
  termsLink: string;
  accept: string;
  required: string;
  access: string;
  error: string;
}

export function ConsentForm({
  eventSlug,
  stageSlug,
  termsHref,
  labels,
}: {
  eventSlug: string;
  stageSlug: string;
  termsHref: string;
  labels: Labels;
}) {
  const [state, formAction, pending] = useActionState<ConsentState, FormData>(
    acceptConsentAction,
    {},
  );

  const errorText =
    state.error === "required"
      ? labels.required
      : state.error === "access"
        ? labels.access
        : state.error === "error"
          ? labels.error
          : null;

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <input type="hidden" name="stageSlug" value={stageSlug} />

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="acceptedRights"
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
        />
        <span>{labels.rights}</span>
      </label>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="confirmedAdult"
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
        />
        <span>{labels.adult}</span>
      </label>

      <a
        href={termsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-accent underline underline-offset-4"
      >
        {labels.termsLink}
      </a>

      {errorText && <p className="text-sm text-destructive">{errorText}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition disabled:opacity-60"
      >
        {labels.accept}
      </button>
    </form>
  );
}
