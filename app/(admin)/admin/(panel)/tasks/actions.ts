"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/access";
import { completions, moveInOrder, nextOrder, tasks } from "@/lib/db";
import { fieldErrors, taskSchema } from "@/lib/schemas";
import type { TaskSchedule } from "@/lib/types";

export type TaskFormState = { errors?: Record<string, string> };

export async function saveTask(_prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  await requireAdmin();

  const parsed = taskSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    details: String(formData.get("details") ?? ""),
    petId: String(formData.get("petId") ?? ""),
    category: String(formData.get("category") ?? ""),
    scheduleType: String(formData.get("scheduleType") ?? ""),
    times: formData.getAll("times").map(String),
    days: formData.getAll("days").map(String),
    weeklyTime: String(formData.get("weeklyTime") ?? ""),
    onceDate: String(formData.get("onceDate") ?? ""),
    onceTime: String(formData.get("onceTime") ?? ""),
    optional: formData.get("optional") === "on",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const schedule: TaskSchedule =
    v.scheduleType === "daily"
      ? { type: "daily", times: [...new Set(v.times.filter(Boolean))].sort() }
      : v.scheduleType === "weekly"
        ? { type: "weekly", days: [...new Set(v.days)].sort() as (0 | 1 | 2 | 3 | 4 | 5 | 6)[], time: v.weeklyTime }
        : { type: "once", date: v.onceDate, time: v.onceTime };

  const id = String(formData.get("id") ?? "") || undefined;
  const existing = id ? await tasks.get(id) : null;
  if (id && !existing) return { errors: { form: "This task no longer exists." } };

  await tasks.upsert({
    id,
    title: v.title,
    details: v.details || undefined,
    petId: v.petId || undefined,
    category: v.category,
    schedule,
    optional: v.optional || undefined,
    active: v.active,
    order: existing?.order ?? (await nextOrder("tasks")),
  });

  revalidatePath("/", "layout");
  redirect("/admin/tasks");
}

/** Deletes the task and its ticked-off history. */
export async function deleteTask(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const history = (await completions.list()).filter((c) => c.taskId === id);
  await Promise.all([tasks.delete(id), ...history.map((c) => completions.delete(c.id))]);
  revalidatePath("/", "layout");
  redirect("/admin/tasks");
}

export async function moveTask(formData: FormData) {
  await requireAdmin();
  const direction = formData.get("direction") === "up" ? "up" : "down";
  await moveInOrder("tasks", String(formData.get("id") ?? ""), direction);
  revalidatePath("/", "layout");
}
