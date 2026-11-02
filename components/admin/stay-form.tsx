"use client";

import { useActionState } from "react";

import { saveStay } from "@/app/(admin)/admin/(panel)/stays/actions";
import { Field, describedBy } from "@/components/admin/field";
import { FormAlert, FormFooter, useFormValues, type FormState } from "@/components/admin/form-parts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Stay } from "@/lib/types";

export function StayForm({ stay }: { stay?: Stay }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveStay, {});
  const e = state.errors ?? {};
  const { bind } = useFormValues({
    guestName: stay?.guestName ?? "",
    startDate: stay?.startDate ?? "",
    endDate: stay?.endDate ?? "",
    notes: stay?.notes ?? "",
  });

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {stay && <input type="hidden" name="id" value={stay.id} />}
      <FormAlert message={e.form} />
      <Field id="guestName" label="Guest" hint="Shown in the greeting, e.g. “Sam”." error={e.guestName}>
        <Input {...describedBy("guestName", e.guestName, true)} {...bind("guestName")} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="startDate" label="First day" error={e.startDate}>
          <Input {...describedBy("startDate", e.startDate)} {...bind("startDate")} type="date" />
        </Field>
        <Field id="endDate" label="Last day" error={e.endDate}>
          <Input {...describedBy("endDate", e.endDate)} {...bind("endDate")} type="date" />
        </Field>
      </div>
      <Field id="notes" label="Notes" hint="Optional, for you only." error={e.notes}>
        <Textarea {...describedBy("notes", e.notes, true)} {...bind("notes")} rows={2} />
      </Field>
      <FormFooter pending={pending} label={stay ? "Save stay" : "Add stay"} cancelHref="/admin/stays" hasErrors={!!state.errors} />
    </form>
  );
}
