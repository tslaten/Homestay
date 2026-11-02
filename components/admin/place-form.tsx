"use client";

import { useActionState } from "react";

import { savePlace } from "@/app/(admin)/admin/(panel)/places/actions";
import { Field, describedBy } from "@/components/admin/field";
import { Checkbox, FormAlert, FormFooter, useFormValues, type FormState } from "@/components/admin/form-parts";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Place } from "@/lib/types";

export const PLACE_CATEGORIES: Record<Place["category"], string> = {
  food: "Food",
  coffee: "Coffee",
  grocery: "Groceries",
  pharmacy: "Pharmacy",
  park: "Parks",
  attraction: "Attractions",
  shopping: "Shopping",
  medical: "Medical",
};

export function PlaceForm({ place }: { place?: Place }) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePlace, {});
  const e = state.errors ?? {};
  const { bind, check } = useFormValues({
    name: place?.name ?? "",
    category: place?.category ?? "food",
    description: place?.description ?? "",
    address: place?.address ?? "",
    driveMinutes: place?.driveMinutes?.toString() ?? "",
    phone: place?.phone ?? "",
    url: place?.url ?? "",
    favorite: place?.favorite ?? false,
  });

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {place && <input type="hidden" name="id" value={place.id} />}
      <FormAlert message={e.form} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" error={e.name}>
          <Input {...describedBy("name", e.name)} {...bind("name")} />
        </Field>
        <Field id="category" label="Category" error={e.category}>
          <NativeSelect {...describedBy("category", e.category)} {...bind("category")}>
            {Object.entries(PLACE_CATEGORIES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Field id="description" label="Description" hint="What it’s good for, in a sentence or two." error={e.description}>
        <Textarea {...describedBy("description", e.description, true)} {...bind("description")} rows={3} />
      </Field>
      <Field
        id="address"
        label="Address"
        hint="Optional. Makes the Directions link exact; without it, Maps searches the name in Orlando."
        error={e.address}
      >
        <Input {...describedBy("address", e.address, true)} {...bind("address")} autoComplete="off" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="driveMinutes" label="Drive (minutes)" hint="Optional." error={e.driveMinutes}>
          <Input {...describedBy("driveMinutes", e.driveMinutes, true)} {...bind("driveMinutes")} inputMode="numeric" />
        </Field>
        <Field id="phone" label="Phone" hint="Optional." error={e.phone}>
          <Input {...describedBy("phone", e.phone, true)} {...bind("phone")} type="tel" />
        </Field>
      </div>
      <Field id="url" label="Website" hint="Optional, e.g. https://example.com" error={e.url}>
        <Input {...describedBy("url", e.url, true)} {...bind("url")} type="url" inputMode="url" />
      </Field>
      <Checkbox label="Host’s pick (starred, and listed under “Host’s picks”)" {...check("favorite")} />
      <FormFooter pending={pending} label={place ? "Save place" : "Add place"} cancelHref="/admin/places" hasErrors={!!state.errors} />
    </form>
  );
}
