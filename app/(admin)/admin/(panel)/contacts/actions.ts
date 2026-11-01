"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FormState } from "@/components/admin/form-parts";
import { requireAdmin } from "@/lib/auth/access";
import { contacts, moveInOrder, nextOrder, pets } from "@/lib/db";
import { contactSchema, fieldErrors } from "@/lib/schemas";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function saveContact(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = contactSchema.safeParse({
    name: str(fd, "name"),
    role: str(fd, "role"),
    phone: str(fd, "phone"),
    email: str(fd, "email"),
    notes: str(fd, "notes"),
    emergency: fd.get("emergency") === "on",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const id = str(fd, "id") || undefined;
  const existing = id ? await contacts.get(id) : null;
  if (id && !existing) return { errors: { form: "This contact no longer exists." } };

  await contacts.upsert({
    id,
    name: v.name,
    role: v.role,
    phone: v.phone || undefined,
    email: v.email || undefined,
    notes: v.notes || undefined,
    emergency: v.emergency,
    order: existing?.order ?? (await nextOrder("contacts")),
  });
  revalidatePath("/", "layout");
  redirect("/admin/contacts");
}

/** Deletes the contact; pets that used it as their vet lose the link. */
export async function deleteContact(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const linked = (await pets.list()).filter((p) => p.vetContactId === id);
  await Promise.all(linked.map((p) => pets.upsert({ ...p, vetContactId: undefined })));
  await contacts.delete(id);
  revalidatePath("/", "layout");
  redirect("/admin/contacts");
}

export async function moveContact(fd: FormData) {
  await requireAdmin();
  await moveInOrder("contacts", str(fd, "id"), fd.get("direction") === "up" ? "up" : "down");
  revalidatePath("/", "layout");
}
