"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { savePet, type PetFormState } from "@/app/(admin)/admin/(panel)/pets/actions";
import { Field, describedBy } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Pet } from "@/lib/types";

/** Add/edit a pet. Controlled inputs, so validation errors never wipe what was typed. */
export function PetForm({ pet, vets }: { pet?: Pet; vets: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<PetFormState, FormData>(savePet, {});
  const e = state.errors ?? {};

  const [v, setV] = useState({
    name: pet?.name ?? "",
    species: pet?.species ?? "cat",
    breed: pet?.breed ?? "",
    about: pet?.about ?? "",
    feeding: pet?.feeding ?? "",
    medical: pet?.medical ?? "",
    hidingSpots: (pet?.hidingSpots ?? []).join("\n"),
    vetContactId: pet?.vetContactId ?? "",
  });
  const bind = (key: keyof typeof v) => ({
    value: v[key],
    onChange: (ev: { target: { value: string } }) => setV({ ...v, [key]: ev.target.value }),
  });

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {pet && <input type="hidden" name="id" value={pet.id} />}
      {e.form && (
        <p role="alert" className="rounded-md bg-destructive/15 p-3 text-destructive">
          {e.form}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" error={e.name}>
          <Input {...describedBy("name", e.name)} {...bind("name")} />
        </Field>
        <Field id="species" label="Species" error={e.species}>
          <NativeSelect {...describedBy("species", e.species)} {...bind("species")}>
            <option value="cat">Cat</option>
            <option value="dog">Dog</option>
            <option value="bird">Bird</option>
            <option value="fish">Fish</option>
            <option value="other">Other</option>
          </NativeSelect>
        </Field>
      </div>
      <Field id="breed" label="Breed" error={e.breed}>
        <Input {...describedBy("breed", e.breed)} {...bind("breed")} />
      </Field>
      <Field id="about" label="About" hint="A sentence or two the sitter should know." error={e.about}>
        <Textarea {...describedBy("about", e.about, true)} {...bind("about")} rows={3} />
      </Field>
      <Field id="feeding" label="Feeding" error={e.feeding}>
        <Textarea {...describedBy("feeding", e.feeding)} {...bind("feeding")} rows={3} />
      </Field>
      <Field id="medical" label="Medical" hint="Medication and doses. Leave empty if none." error={e.medical}>
        <Textarea {...describedBy("medical", e.medical, true)} {...bind("medical")} rows={2} />
      </Field>
      <Field id="hidingSpots" label="Hiding spots" hint="One per line." error={e.hidingSpots}>
        <Textarea {...describedBy("hidingSpots", e.hidingSpots, true)} {...bind("hidingSpots")} rows={4} />
      </Field>
      <Field id="vetContactId" label="Vet" hint="Pick from Contacts." error={e.vetContactId}>
        <NativeSelect {...describedBy("vetContactId", e.vetContactId, true)} {...bind("vetContactId")}>
          <option value="">None</option>
          {vets.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" size="compact" disabled={pending}>
          {pending ? "Saving…" : pet ? "Save pet" : "Add pet"}
        </Button>
        <Button asChild size="compact" variant="outline">
          <Link href="/admin/pets">Cancel</Link>
        </Button>
        {state.errors && !pending && <p className="text-sm text-destructive">Please fix the highlighted fields.</p>}
      </div>
    </form>
  );
}
