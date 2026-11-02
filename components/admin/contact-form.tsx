"use client";

import { useActionState } from "react";

import { saveContact } from "@/app/(admin)/admin/(panel)/contacts/actions";
import { Field, describedBy } from "@/components/admin/field";
import { Checkbox, FormAlert, FormFooter, useFormValues, type FormState } from "@/components/admin/form-parts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Contact } from "@/lib/types";

export function ContactForm({ contact }: { contact?: Contact }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveContact, {});
  const e = state.errors ?? {};
  const { bind, check } = useFormValues({
    name: contact?.name ?? "",
    role: contact?.role ?? "",
    phone: contact?.phone ?? "",
    email: contact?.email ?? "",
    notes: contact?.notes ?? "",
    emergency: contact?.emergency ?? false,
  });

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {contact && <input type="hidden" name="id" value={contact.id} />}
      <FormAlert message={e.form} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" error={e.name}>
          <Input {...describedBy("name", e.name)} {...bind("name")} />
        </Field>
        <Field id="role" label="Role" hint="e.g. Host, Vet, Neighbor" error={e.role}>
          <Input {...describedBy("role", e.role, true)} {...bind("role")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone" error={e.phone}>
          <Input {...describedBy("phone", e.phone)} {...bind("phone")} type="tel" />
        </Field>
        <Field id="email" label="Email" hint="Optional." error={e.email}>
          <Input {...describedBy("email", e.email, true)} {...bind("email")} type="email" inputMode="email" />
        </Field>
      </div>
      <Field id="notes" label="Notes" hint="Optional, e.g. hours or when to call." error={e.notes}>
        <Textarea {...describedBy("notes", e.notes, true)} {...bind("notes")} rows={2} />
      </Field>
      <Checkbox label="Emergency contact (shown in the red box at the top)" {...check("emergency")} />
      <FormFooter
        pending={pending}
        label={contact ? "Save contact" : "Add contact"}
        cancelHref="/admin/contacts"
        hasErrors={!!state.errors}
      />
    </form>
  );
}
