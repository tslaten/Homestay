"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FormState } from "@/components/admin/form-parts";
import { requireAdmin } from "@/lib/auth/access";
import { stays } from "@/lib/db";
import { fieldErrors, staySchema } from "@/lib/schemas";
import { formatDateRange } from "@/lib/time";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function saveStay(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = staySchema.safeParse({
    guestName: str(fd, "guestName"),
    startDate: str(fd, "startDate"),
    endDate: str(fd, "endDate"),
    notes: str(fd, "notes"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const id = str(fd, "id") || undefined;
  if (id && !(await stays.get(id))) return { errors: { form: "This stay no longer exists." } };

  // The guest screens show one stay per day, so stays can't overlap.
  const clash = (await stays.list()).find((s) => s.id !== id && s.startDate <= v.endDate && v.startDate <= s.endDate);
  if (clash) {
    return {
      errors: { endDate: `Overlaps ${clash.guestName}’s stay (${formatDateRange(clash.startDate, clash.endDate)})` },
    };
  }

  await stays.upsert({ id, guestName: v.guestName, startDate: v.startDate, endDate: v.endDate, notes: v.notes || undefined });
  revalidatePath("/", "layout");
  redirect("/admin/stays");
}

export async function deleteStay(fd: FormData) {
  await requireAdmin();
  await stays.delete(str(fd, "id"));
  revalidatePath("/", "layout");
  redirect("/admin/stays");
}
