import { occurrencesOn } from "./schedule";
import { addDays, todayISO, type ISODate, type LocalTime, type Timestamp } from "./time";
import type { Completion, Task } from "./types";

/**
 * done     – ticked off
 * missed   – required, its time has passed, not ticked
 * skipped  – optional, its time has passed, not ticked
 * upcoming – later today
 */
export type HistoryStatus = "done" | "missed" | "skipped" | "upcoming";

export interface HistoryItem {
  key: string;
  taskId: string;
  title: string;
  petId?: string;
  time: LocalTime;
  optional: boolean;
  status: HistoryStatus;
  completedAt?: Timestamp;
  /** Ticked on a later day than it was due (e.g. the evening feed ticked next morning). */
  completedLate?: boolean;
}

export interface HistoryDay {
  date: ISODate;
  items: HistoryItem[];
  /** Required items whose time has come. */
  due: number;
  /** Of those, how many were ticked. */
  done: number;
  missed: number;
}

export interface HistorySummary {
  days: HistoryDay[];
  due: number;
  done: number;
  missed: { date: ISODate; item: HistoryItem }[];
}

/**
 * Day-by-day record of what was due and what got ticked, newest day first.
 * What was due comes from each task's current schedule; ticks are kept even
 * if the task was later paused or rescheduled. Days after `today` are left out.
 */
export function buildHistory({
  tasks,
  completions,
  from,
  to,
  today,
  now,
}: {
  tasks: Task[];
  completions: Completion[];
  from: ISODate;
  to: ISODate;
  /** New York date and "HH:mm" time right now (lib/time.ts). */
  today: ISODate;
  now: LocalTime;
}): HistorySummary {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const last = to < today ? to : today;
  const days: HistoryDay[] = [];

  for (let date = last; date >= from; date = addDays(date, -1)) {
    const ticks = completions.filter((c) => c.date === date);
    const tickAt = new Map(ticks.map((c) => [`${c.taskId}@${c.time}`, c.completedAt]));
    const isPast = (time: LocalTime) => date < today || time <= now;

    const items: HistoryItem[] = occurrencesOn(tasks, ticks, date).map((o) => {
      const key = `${o.task.id}@${o.time}`;
      const optional = !!o.task.optional;
      const status: HistoryStatus = o.done
        ? "done"
        : !isPast(o.time)
          ? "upcoming"
          : optional
            ? "skipped"
            : "missed";
      return withTick({ key, taskId: o.task.id, title: o.task.title, petId: o.task.petId, time: o.time, optional, status }, tickAt.get(key), date);
    });

    // Ticks the current schedule no longer expects (task paused or its time changed): still done.
    const expected = new Set(items.map((i) => i.key));
    for (const c of ticks) {
      const key = `${c.taskId}@${c.time}`;
      const task = byId.get(c.taskId);
      if (expected.has(key) || !task) continue;
      items.push(
        withTick(
          { key, taskId: task.id, title: task.title, petId: task.petId, time: c.time, optional: !!task.optional, status: "done" },
          c.completedAt,
          date,
        ),
      );
    }
    items.sort((a, b) => a.time.localeCompare(b.time) || (byId.get(a.taskId)?.order ?? 0) - (byId.get(b.taskId)?.order ?? 0));

    const counted = items.filter((i) => !i.optional && i.status !== "upcoming");
    days.push({
      date,
      items,
      due: counted.length,
      done: counted.filter((i) => i.status === "done").length,
      missed: counted.filter((i) => i.status === "missed").length,
    });
  }

  return {
    days,
    due: days.reduce((n, d) => n + d.due, 0),
    done: days.reduce((n, d) => n + d.done, 0),
    missed: days.flatMap((d) => d.items.filter((i) => i.status === "missed").map((item) => ({ date: d.date, item }))),
  };
}

function withTick(item: HistoryItem, completedAt: Timestamp | undefined, date: ISODate): HistoryItem {
  if (!completedAt) return item;
  return { ...item, completedAt, completedLate: todayISO(new Date(completedAt)) > date };
}
