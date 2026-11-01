"use client";

import { useState } from "react";
import Link from "next/link";

import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Button } from "@/components/ui/button";

export type FormState = { errors?: Record<string, string> };

/**
 * Controlled form values, so a failed save never wipes what was typed.
 * `bind` is for text inputs/selects, `check` for checkboxes.
 */
export function useFormValues<T extends Record<string, string | boolean>>(initial: T) {
  const [v, setV] = useState(initial);
  const bind = (key: { [K in keyof T]: T[K] extends string ? K : never }[keyof T]) => ({
    value: v[key] as string,
    onChange: (ev: { target: { value: string } }) => setV((p) => ({ ...p, [key]: ev.target.value })),
  });
  const check = (key: { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T]) => ({
    name: String(key),
    checked: v[key] as boolean,
    onChange: (ev: { target: { checked: boolean } }) => setV((p) => ({ ...p, [key]: ev.target.checked })),
  });
  return { v, bind, check };
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-destructive/15 p-3 text-destructive">
      {message}
    </p>
  );
}

export function Checkbox({ label, ...props }: React.ComponentProps<"input"> & { label: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3">
      <input type="checkbox" className="size-5 accent-primary" {...props} />
      <span>{label}</span>
    </label>
  );
}

/** Save / Cancel row at the bottom of every editor form. */
export function FormFooter({
  pending,
  label,
  cancelHref,
  hasErrors,
}: {
  pending: boolean;
  label: string;
  cancelHref: string;
  hasErrors: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" size="compact" disabled={pending}>
        {pending ? "Saving…" : label}
      </Button>
      <Button asChild size="compact" variant="outline">
        <Link href={cancelHref}>Cancel</Link>
      </Button>
      {hasErrors && !pending && <p className="text-sm text-destructive">Please fix the highlighted fields.</p>}
    </div>
  );
}

/** Separate form under the editor that deletes the record after a confirm. */
export function DeleteForm({
  action,
  id,
  label,
  message,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  message: string;
}) {
  return (
    <form action={action} className="border-t pt-6">
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit size="compact" variant="outline" message={message}>
        {label}
      </ConfirmSubmit>
    </form>
  );
}
