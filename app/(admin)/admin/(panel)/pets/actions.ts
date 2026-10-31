"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/access";
import { moveInOrder, nextOrder, pets, tasks } from "@/lib/db";
import { fieldErrors, petSchema } from "@/lib/schemas";

export type PetFormState = { errors?: Record<string, string> };

export async function savePet(_prev: PetFormState, formData: FormData): Promise<PetFormState> {
  await requireAdmin();

  const parsed = petSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    species: String(formData.get("species") ?? ""),
    breed: String(formData.get("breed") ?? ""),
    about: String(formData.get("about") ?? ""),
    feeding: String(formData.get("feeding") ?? ""),
    medical: String(formData.get("medical") ?? ""),
    hidingSpots: String(formData.get("hidingSpots") ?? "").split("\n"),
    vetContactId: String(formData.get("vetContactId") ?? ""),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const id = String(formData.get("id") ?? "") || undefined;
  const existing = id ? await pets.get(id) : null;
  if (id && !existing) return { errors: { form: "This pet no longer exists." } };

  await pets.upsert({
    id,
    name: v.name,
    species: v.species,
    breed: v.breed || undefined,
    about: v.about,
    feeding: v.feeding,
    medical: v.medical || undefined,
    hidingSpots: v.hidingSpots.length > 0 ? v.hidingSpots : undefined,
    vetContactId: v.vetContactId || undefined,
    photoUrl: existing?.photoUrl,
    order: existing?.order ?? (await nextOrder("pets")),
  });

  revalidatePath("/", "layout");
  redirect("/admin/pets");
}

/** Deletes the pet. Its tasks stay, no longer linked to a pet. */
export async function deletePet(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const linked = (await tasks.list()).filter((t) => t.petId === id);
  await Promise.all(linked.map((t) => tasks.upsert({ ...t, petId: undefined })));
  await pets.delete(id);
  revalidatePath("/", "layout");
  redirect("/admin/pets");
}

export async function movePet(formData: FormData) {
  await requireAdmin();
  const direction = formData.get("direction") === "up" ? "up" : "down";
  await moveInOrder("pets", String(formData.get("id") ?? ""), direction);
  revalidatePath("/", "layout");
}
