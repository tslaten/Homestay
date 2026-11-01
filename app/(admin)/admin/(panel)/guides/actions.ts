"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FormState } from "@/components/admin/form-parts";
import { requireAdmin } from "@/lib/auth/access";
import { howtos, moveInOrder, nextOrder } from "@/lib/db";
import { fieldErrors, guideSchema } from "@/lib/schemas";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function saveGuide(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = guideSchema.safeParse({
    title: str(fd, "title"),
    category: str(fd, "category"),
    summary: str(fd, "summary"),
    steps: str(fd, "steps").split("\n"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const id = str(fd, "id") || undefined;
  const existing = id ? await howtos.get(id) : null;
  if (id && !existing) return { errors: { form: "This guide no longer exists." } };

  await howtos.upsert({
    id,
    title: v.title,
    category: v.category,
    summary: v.summary || undefined,
    steps: v.steps,
    order: existing?.order ?? (await nextOrder("howtos")),
  });
  revalidatePath("/", "layout");
  redirect("/admin/guides");
}

export async function deleteGuide(fd: FormData) {
  await requireAdmin();
  await howtos.delete(str(fd, "id"));
  revalidatePath("/", "layout");
  redirect("/admin/guides");
}

export async function moveGuide(fd: FormData) {
  await requireAdmin();
  await moveInOrder("howtos", str(fd, "id"), fd.get("direction") === "up" ? "up" : "down");
  revalidatePath("/", "layout");
}
