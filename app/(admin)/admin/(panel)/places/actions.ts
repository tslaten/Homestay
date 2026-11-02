"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FormState } from "@/components/admin/form-parts";
import { requireAdmin } from "@/lib/auth/access";
import { moveInOrder, nextOrder, places } from "@/lib/db";
import { fieldErrors, placeSchema } from "@/lib/schemas";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function savePlace(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = placeSchema.safeParse({
    name: str(fd, "name"),
    category: str(fd, "category"),
    description: str(fd, "description"),
    address: str(fd, "address"),
    driveMinutes: str(fd, "driveMinutes"),
    phone: str(fd, "phone"),
    url: str(fd, "url"),
    favorite: fd.get("favorite") === "on",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const id = str(fd, "id") || undefined;
  const existing = id ? await places.get(id) : null;
  if (id && !existing) return { errors: { form: "This place no longer exists." } };

  await places.upsert({
    id,
    name: v.name,
    category: v.category,
    description: v.description,
    address: v.address || undefined,
    driveMinutes: v.driveMinutes,
    phone: v.phone || undefined,
    url: v.url || undefined,
    favorite: v.favorite || undefined,
    order: existing?.order ?? (await nextOrder("places")),
  });
  revalidatePath("/", "layout");
  redirect("/admin/places");
}

export async function deletePlace(fd: FormData) {
  await requireAdmin();
  await places.delete(str(fd, "id"));
  revalidatePath("/", "layout");
  redirect("/admin/places");
}

export async function movePlace(fd: FormData) {
  await requireAdmin();
  await moveInOrder("places", str(fd, "id"), fd.get("direction") === "up" ? "up" : "down");
  revalidatePath("/", "layout");
}
