"use server";

import { revalidatePath } from "next/cache";

import { completeTask, tasks, uncompleteTask } from "@/lib/db";
import { slotsOn } from "@/lib/schedule";
import { addDays, todayISO } from "@/lib/time";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/**
 * Mark one task occurrence done or not done. Arguments come from the client,
 * so check the occurrence really exists before writing anything.
 */
export async function setTaskDone(taskId: string, date: string, time: string, done: boolean) {
  if (typeof taskId !== "string" || !DATE_RE.test(date) || !TIME_RE.test(time)) {
    throw new Error("Invalid task occurrence");
  }

  // Only today, or yesterday for a screen left open across midnight (New York).
  const today = todayISO();
  if (date !== today && date !== addDays(today, -1)) {
    throw new Error("Can only update today's tasks");
  }

  const task = await tasks.get(taskId);
  if (!task || !slotsOn(task, date).includes(time)) {
    throw new Error("Task is not scheduled at that time");
  }

  if (done) await completeTask(taskId, date, time);
  else await uncompleteTask(taskId, date, time);

  // Refresh this screen and make Home re-fetch its progress summary.
  revalidatePath("/", "layout");
}
