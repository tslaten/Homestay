"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FormState } from "@/components/admin/form-parts";
import { requireAdmin } from "@/lib/auth/access";
import { codes, moveInOrder, nextOrder } from "@/lib/db";
import { codeSchema, fieldErrors } from "@/lib/schemas";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function saveCode(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = codeSchema.safeParse({
    label: str(fd, "label"),
    value: str(fd, "value"),
    location: str(fd, "location"),
    notes: str(fd, "notes"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const id = str(fd, "id") || undefined;
  const existing = id ? await codes.get(id) : null;
  if (id && !existing) return { errors: { form: "This code no longer exists." } };

  await codes.upsert({
    id,
    label: v.label,
    value: v.value,
    location: v.location || undefined,
    notes: v.notes || undefined,
    order: existing?.order ?? (await nextOrder("codes")),
  });
  revalidatePath("/", "layout");
  redirect("/admin/codes");
}

export async function deleteCode(fd: FormData) {
  await requireAdmin();
  await codes.delete(str(fd, "id"));
  revalidatePath("/", "layout");
  redirect("/admin/codes");
}

export async function moveCode(fd: FormData) {
  await requireAdmin();
  await moveInOrder("codes", str(fd, "id"), fd.get("direction") === "up" ? "up" : "down");
  revalidatePath("/", "layout");
}
