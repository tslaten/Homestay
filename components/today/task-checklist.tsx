"use client";

import { Fragment, startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { Moon02Icon, Sun03Icon, SunriseIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { setTaskDone } from "@/app/today/actions";
import { cn } from "@/lib/utils";

/** One task occurrence, pre-formatted on the server (New York time). */
export interface ChecklistItem {
  key: string;
  taskId: string;
  date: string;
  time: string;
  timeLabel: string;
  title: string;
  details?: string;
  petName?: string;
  done: boolean;
  doneLabel?: string;
}

const PERIODS: { id: string; label: string; icon: IconSvgElement; until: string }[] = [
  { id: "morning", label: "Morning", icon: SunriseIcon, until: "12:00" },
  { id: "afternoon", label: "Afternoon", icon: Sun03Icon, until: "17:00" },
  { id: "evening", label: "Evening", icon: Moon02Icon, until: "24:00" },
];

export function TaskChecklist({
  items,
  currentTime,
}: {
  items: ChecklistItem[];
  /** "HH:mm" in New York when the server rendered; used for overdue. */
  currentTime: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(
    items,
    (state, change: { key: string; done: boolean }) =>
      state.map((i) => (i.key === change.key ? { ...i, done: change.done, doneLabel: change.done ? "Just now" : undefined } : i)),
  );
  const [error, setError] = useState<string | null>(null);

  function toggle(item: ChecklistItem) {
    const done = !item.done;
    setError(null);
    startTransition(async () => {
      setOptimistic({ key: item.key, done });
      try {
        await setTaskDone(item.taskId, item.date, item.time, done);
      } catch {
        setError("Couldn’t save that — please tap again.");
      }
    });
  }

  // On open, bring the first unfinished task into view so the guest never has
  // to scroll past finished ones to find what's left (or what's overdue).
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>('[aria-pressed="false"]');
    if (el && scrollRef.current) {
      scrollRef.current.scrollTop = el.offsetTop - 64; // offsetTop is relative to the scroller (it is `relative`)
    }
  }, []);

  const nextKey = optimistic.find((i) => !i.done && i.time >= currentTime)?.key;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {error && (
        <p role="alert" className="shrink-0 rounded-2xl bg-destructive/15 px-6 py-3 text-xl text-destructive">
          {error}
        </p>
      )}
      {/* One time-ordered grid; a heading starts each part of the day that has tasks. */}
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="grid grid-cols-1 content-start items-start gap-4 p-1 md:grid-cols-3">
          {PERIODS.map((period, idx) => {
            const from = idx === 0 ? "00:00" : PERIODS[idx - 1].until;
            const group = optimistic.filter((i) => i.time >= from && i.time < period.until);
            if (group.length === 0) return null;
            return (
              <Fragment key={period.id}>
                <h2 className="col-span-full flex items-center gap-3 px-1 pt-1 text-2xl">
                  <HugeiconsIcon icon={period.icon} className="size-8 text-muted-foreground" strokeWidth={2} aria-hidden />
                  {period.label}
                  <span className="font-sans text-lg font-normal text-muted-foreground">
                    · {group.filter((i) => i.done).length} of {group.length} done
                  </span>
                </h2>
                {group.map((item) => (
                  <ChecklistRow
                    key={item.key}
                    item={item}
                    overdue={!item.done && item.time < currentTime}
                    next={item.key === nextKey}
                    onToggle={() => toggle(item)}
                  />
                ))}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChecklistRow({
  item,
  overdue,
  next,
  onToggle,
}: {
  item: ChecklistItem;
  overdue: boolean;
  next: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={item.done}
      className={cn(
        "flex min-h-touch w-full items-start gap-4 rounded-3xl border bg-card p-4 text-left shadow-sm",
        "touch-manipulation transition-[transform,background-color] duration-100 active:scale-[0.98] active:bg-accent",
        "outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
        next && "border-primary ring-2 ring-primary",
        overdue && "border-destructive/60",
        item.done && "bg-muted shadow-none",
      )}
    >
      <span
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-full border-[3px]",
          item.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
        )}
        aria-hidden
      >
        {item.done && <HugeiconsIcon icon={Tick02Icon} className="size-8" strokeWidth={3} />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            "font-heading text-2xl leading-tight font-bold",
            item.done && "text-muted-foreground line-through decoration-2",
          )}
        >
          {item.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg text-muted-foreground">
          <span className="tabular-nums">{item.timeLabel}</span>
          {item.petName && <span>· {item.petName}</span>}
          {overdue && (
            <span className="rounded-full bg-destructive/15 px-3 text-base font-medium text-destructive">Overdue</span>
          )}
          {next && !overdue && (
            <span className="rounded-full bg-primary/20 px-3 text-base font-medium text-foreground">Up next</span>
          )}
        </span>
        {item.done ? (
          item.doneLabel && <span className="text-lg text-muted-foreground">Done {item.doneLabel}</span>
        ) : (
          item.details && <span className="line-clamp-2 text-lg text-muted-foreground">{item.details}</span>
        )}
      </span>
    </button>
  );
}
