import type { Completion, ISODate, LocalTime, Task, TaskSchedule } from "./types";
import { formatLocalTime, formatShortDate, weekdayOf } from "./time";

export interface Occurrence {
  task: Task;
  date: ISODate;
  time: LocalTime;
  done: boolean;
}

/** Time slots (New York wall clock) at which `task` is due on `date`. */
export function slotsOn(task: Task, date: ISODate): LocalTime[] {
  if (!task.active) return [];
  const s = task.schedule;
  switch (s.type) {
    case "daily":
      return [...s.times].sort();
    case "weekly":
      return s.days.includes(weekdayOf(date)) ? [s.time] : [];
    case "once":
      return s.date === date ? [s.time] : [];
  }
}

/** Occurrences that count toward progress, "overdue" and "up next" (optional ones don't). */
export function required(occurrences: Occurrence[]): Occurrence[] {
  return occurrences.filter((o) => !o.task.optional);
}

/** Every task occurrence on `date`, in time order, flagged done/not done. */
export function occurrencesOn(tasks: Task[], completions: Completion[], date: ISODate): Occurrence[] {
  const done = new Set(completions.filter((c) => c.date === date).map((c) => `${c.taskId}@${c.time}`));
  return tasks
    .flatMap((task) =>
      slotsOn(task, date).map((time) => ({ task, date, time, done: done.has(`${task.id}@${time}`) })),
    )
    .sort((a, b) => a.time.localeCompare(b.time) || a.task.order - b.task.order);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Daily · 8:00 AM, 7:00 PM" / "Mon, Thu · 9:00 AM" / "Once · Nov 9, 8:00 AM" */
export function describeSchedule(s: TaskSchedule): string {
  switch (s.type) {
    case "daily":
      return `Daily · ${[...s.times].sort().map(formatLocalTime).join(", ")}`;
    case "weekly":
      return `${[...s.days].sort().map((d) => WEEKDAYS[d]).join(", ")} · ${formatLocalTime(s.time)}`;
    case "once":
      return `Once · ${formatShortDate(s.date)}, ${formatLocalTime(s.time)}`;
  }
}
