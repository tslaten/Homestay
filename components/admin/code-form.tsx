"use client";

import { useActionState } from "react";

import { saveCode } from "@/app/(admin)/admin/(panel)/codes/actions";
import { Field, describedBy } from "@/components/admin/field";
import { FormAlert, FormFooter, useFormValues, type FormState } from "@/components/admin/form-parts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Code } from "@/lib/types";

export function CodeForm({ code }: { code?: Code }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCode, {});
  const e = state.errors ?? {};
  const { bind } = useFormValues({
    label: code?.label ?? "",
    value: code?.value ?? "",
    location: code?.location ?? "",
    notes: code?.notes ?? "",
  });

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {code && <input type="hidden" name="id" value={code.id} />}
      <FormAlert message={e.form} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="label" label="Label" hint="e.g. Front door" error={e.label}>
          <Input {...describedBy("label", e.label, true)} {...bind("label")} />
        </Field>
        <Field id="value" label="Code" error={e.value}>
          <Input {...describedBy("value", e.value)} {...bind("value")} autoComplete="off" className="font-mono" />
        </Field>
      </div>
      <Field id="location" label="Where" hint="Optional, e.g. Keypad by the front door" error={e.location}>
        <Input {...describedBy("location", e.location, true)} {...bind("location")} />
      </Field>
      <Field id="notes" label="How to use it" hint="Optional." error={e.notes}>
        <Textarea {...describedBy("notes", e.notes, true)} {...bind("notes")} rows={3} />
      </Field>
      <FormFooter pending={pending} label={code ? "Save code" : "Add code"} cancelHref="/admin/codes" hasErrors={!!state.errors} />
    </form>
  );
}
