"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { saveTask, type TaskFormState } from "@/app/(admin)/admin/(panel)/tasks/actions";
import { Field, describedBy } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Add/edit a task. Every input is controlled, so nothing is lost when the
 * server sends back validation errors (React only resets uncontrolled fields).
 */
export function TaskForm({ task, pets }: { task?: Task; pets: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<TaskFormState, FormData>(saveTask, {});
  const e = state.errors ?? {};
  const s = task?.schedule;

  const [title, setTitle] = useState(task?.title ?? "");
  const [details, setDetails] = useState(task?.details ?? "");
  const [petId, setPetId] = useState(task?.petId ?? "");
  const [category, setCategory] = useState<Task["category"]>(task?.category ?? "pet");
  const [type, setType] = useState<"daily" | "weekly" | "once">(s?.type ?? "daily");
  const [times, setTimes] = useState<string[]>(s?.type === "daily" ? s.times : ["08:00"]);
  const [days, setDays] = useState<number[]>(s?.type === "weekly" ? s.days : [1]);
  const [weeklyTime, setWeeklyTime] = useState(s?.type === "weekly" ? s.time : "19:00");
  const [onceDate, setOnceDate] = useState(s?.type === "once" ? s.date : "");
  const [onceTime, setOnceTime] = useState(s?.type === "once" ? s.time : "08:00");
  const [optional, setOptional] = useState(task?.optional ?? false);
  const [active, setActive] = useState(task?.active ?? true);

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {task && <input type="hidden" name="id" value={task.id} />}
      {e.form && (
        <p role="alert" className="rounded-md bg-destructive/15 p-3 text-destructive">
          {e.form}
        </p>
      )}

      <Field id="title" label="Task" error={e.title}>
        <Input {...describedBy("title", e.title)} value={title} onChange={(ev) => setTitle(ev.target.value)} />
      </Field>
      <Field id="details" label="Details" hint="Shown on the task card, e.g. how much food." error={e.details}>
        <Textarea
          {...describedBy("details", e.details, true)}
          value={details}
          onChange={(ev) => setDetails(ev.target.value)}
          rows={2}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="petId" label="For" error={e.petId}>
          <NativeSelect {...describedBy("petId", e.petId)} value={petId} onChange={(ev) => setPetId(ev.target.value)}>
            <option value="">Not a specific pet</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="category" label="Kind" error={e.category}>
          <NativeSelect
            {...describedBy("category", e.category)}
            value={category}
            onChange={(ev) => setCategory(ev.target.value as Task["category"])}
          >
            <option value="pet">Pet care</option>
            <option value="home">Home</option>
            <option value="plants">Plants</option>
            <option value="trash">Trash</option>
            <option value="other">Other</option>
          </NativeSelect>
        </Field>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-heading text-sm font-bold">Repeats (New York time)</legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["daily", "Every day"],
              ["weekly", "Weekly"],
              ["once", "Once"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-md border text-sm font-bold",
                type === value ? "border-primary bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              <input
                type="radio"
                name="scheduleType"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>

        {type === "daily" && (
          <div className="flex flex-col gap-2">
            {times.map((t, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  type="time"
                  name="times"
                  aria-label={`Time ${i + 1}`}
                  aria-invalid={e.times ? true : undefined}
                  value={t}
                  onChange={(ev) => setTimes(times.map((x, j) => (j === i ? ev.target.value : x)))}
                />
                {times.length > 1 && (
                  <Button
                    type="button"
                    size="compact"
                    variant="outline"
                    aria-label={`Remove time ${i + 1}`}
                    onClick={() => setTimes(times.filter((_, j) => j !== i))}
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} aria-hidden />
                  </Button>
                )}
              </div>
            ))}
            {times.length < 6 && (
              <Button
                type="button"
                size="compact"
                variant="outline"
                className="self-start"
                onClick={() => setTimes([...times, ""])}
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} aria-hidden />
                Add a time
              </Button>
            )}
            {e.times && <p className="text-sm text-destructive">{e.times}</p>}
          </div>
        )}

        {type === "weekly" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Days">
              {DAYS.map((label, d) => {
                const on = days.includes(d);
                return (
                  <label
                    key={d}
                    className={cn(
                      "flex h-11 min-w-12 cursor-pointer items-center justify-center rounded-md border px-2 text-sm font-bold",
                      on ? "border-primary bg-primary text-primary-foreground" : "bg-card",
                    )}
                  >
                    <input
                      type="checkbox"
                      name="days"
                      value={d}
                      checked={on}
                      onChange={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])}
                      className="sr-only"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
            {e.days && <p className="text-sm text-destructive">{e.days}</p>}
            <Field id="weeklyTime" label="Time" error={e.weeklyTime}>
              <Input
                {...describedBy("weeklyTime", e.weeklyTime)}
                type="time"
                value={weeklyTime}
                onChange={(ev) => setWeeklyTime(ev.target.value)}
              />
            </Field>
          </div>
        )}

        {type === "once" && (
          <div className="grid grid-cols-2 gap-4">
            <Field id="onceDate" label="Date" error={e.onceDate}>
              <Input
                {...describedBy("onceDate", e.onceDate)}
                type="date"
                value={onceDate}
                onChange={(ev) => setOnceDate(ev.target.value)}
              />
            </Field>
            <Field id="onceTime" label="Time" error={e.onceTime}>
              <Input
                {...describedBy("onceTime", e.onceTime)}
                type="time"
                value={onceTime}
                onChange={(ev) => setOnceTime(ev.target.value)}
              />
            </Field>
          </div>
        )}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name="optional"
            checked={optional}
            onChange={(ev) => setOptional(ev.target.checked)}
            className="size-5 accent-primary"
          />
          <span>Optional (never overdue, not counted in progress)</span>
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name="active"
            checked={active}
            onChange={(ev) => setActive(ev.target.checked)}
            className="size-5 accent-primary"
          />
          <span>Show this task (untick to pause it without deleting)</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="compact" disabled={pending}>
          {pending ? "Saving…" : task ? "Save task" : "Add task"}
        </Button>
        <Button asChild size="compact" variant="outline">
          <Link href="/admin/tasks">Cancel</Link>
        </Button>
        {state.errors && !pending && <p className="text-sm text-destructive">Please fix the highlighted fields.</p>}
      </div>
    </form>
  );
}
