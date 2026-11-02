"use client";

import { useActionState } from "react";

import { saveGuide } from "@/app/(admin)/admin/(panel)/guides/actions";
import { Field, describedBy } from "@/components/admin/field";
import { FormAlert, FormFooter, useFormValues, type FormState } from "@/components/admin/form-parts";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { HowTo } from "@/lib/types";

export const GUIDE_CATEGORIES: Record<HowTo["category"], string> = {
  pets: "Cats",
  safety: "Safety",
  climate: "Heating & cooling",
  appliances: "Appliances",
  entertainment: "TV & entertainment",
  outdoor: "Outdoors",
  other: "Around the house",
};

export function GuideForm({ guide }: { guide?: HowTo }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveGuide, {});
  const e = state.errors ?? {};
  const { bind } = useFormValues({
    title: guide?.title ?? "",
    category: guide?.category ?? "other",
    summary: guide?.summary ?? "",
    steps: (guide?.steps ?? []).join("\n"),
  });

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {guide && <input type="hidden" name="id" value={guide.id} />}
      <FormAlert message={e.form} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="title" label="Title" error={e.title}>
          <Input {...describedBy("title", e.title)} {...bind("title")} />
        </Field>
        <Field id="category" label="Section" error={e.category}>
          <NativeSelect {...describedBy("category", e.category)} {...bind("category")}>
            {Object.entries(GUIDE_CATEGORIES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Field id="summary" label="Summary" hint="Optional. Shown above the steps." error={e.summary}>
        <Textarea {...describedBy("summary", e.summary, true)} {...bind("summary")} rows={2} />
      </Field>
      <Field id="steps" label="Steps" hint="One step per line; they’re numbered for you." error={e.steps}>
        <Textarea {...describedBy("steps", e.steps, true)} {...bind("steps")} rows={7} />
      </Field>
      <FormFooter pending={pending} label={guide ? "Save guide" : "Add guide"} cancelHref="/admin/guides" hasErrors={!!state.errors} />
    </form>
  );
}
