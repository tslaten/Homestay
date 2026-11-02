import { Suspense } from "react";
import Link from "next/link";
import { Alert02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ListSkeleton } from "@/components/admin/admin-list";
import { requireAdmin } from "@/lib/auth/access";
import { completions, pets, stays, tasks } from "@/lib/db";
import { buildHistory, type HistoryItem } from "@/lib/history";
import {
  formatDateRange,
  formatDayDate,
  formatLocalTime,
  formatShortDate,
  formatTimestamp,
  formatTimestampTime,
  nowLocalTime,
  todayISO,
} from "@/lib/time";
import { cn } from "@/lib/utils";

export const metadata = { title: "History · Guest Guide admin" };

export default function HistoryPage({ searchParams }: PageProps<"/admin/history">) {
  return (
    <>
      <h1 className="mb-2 text-3xl">History</h1>
      <p className="mb-6 text-muted-foreground">What was ticked off on the Today screen, day by day.</p>
      <Suspense fallback={<ListSkeleton />}>
        <History searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/** The summary lists this many missed tasks; the rest are marked in the day lists. */
const MISSED_SHOWN = 5;

type Range = { id: string; label: string; from: string; to: string };

async function History({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();
  const today = todayISO(now);

  const [stayList, taskList, petList, completionList] = await Promise.all([
    stays.list(),
    tasks.list(),
    pets.list(),
    completions.list(),
  ]);

  // Tasks are for whoever is staying, so history is kept per stay: every stay that has started, newest first.
  const ranges: Range[] = stayList
    .filter((s) => s.startDate <= today)
    .reverse()
    .map((s) => ({ id: s.id, label: `${s.guestName}, ${formatDateRange(s.startDate, s.endDate)}`, from: s.startDate, to: s.endDate }));
  if (ranges.length === 0) {
    const next = stayList.find((s) => s.startDate > today);
    return (
      <p className="rounded-2xl border border-dashed p-4 text-muted-foreground">
        History starts with the first stay
        {next ? ` (${next.guestName}, from ${formatShortDate(next.startDate)})` : ""}. Add stays under{" "}
        <Link href="/admin/stays" className="underline">
          Stays
        </Link>
        .
      </p>
    );
  }
  // Default: the stay happening now, else the latest one.
  const wanted = typeof params.stay === "string" ? params.stay : undefined;
  const range = ranges.find((r) => r.id === wanted) ?? ranges.find((r) => r.from <= today && today <= r.to) ?? ranges[0];

  const history = buildHistory({ tasks: taskList, completions: completionList, from: range.from, to: range.to, today, now: nowLocalTime(now) });
  const petName = new Map(petList.map((p) => [p.id, p.name]));
  const pct = history.due ? Math.round((history.done / history.due) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Stay" className="flex flex-wrap gap-2">
        {ranges.map((r) => (
          <Link
            key={r.id}
            href={`/admin/history?stay=${r.id}`}
            aria-current={r.id === range.id ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center rounded-full border px-4 font-heading text-sm font-bold",
              r.id === range.id ? "border-primary bg-primary text-primary-foreground" : "bg-card active:bg-accent",
            )}
          >
            {r.label}
          </Link>
        ))}
      </nav>

      <section aria-label="Summary" className="rounded-2xl border bg-card p-4 shadow-sm">
        {pct === null ? (
          <p className="text-muted-foreground">Nothing was due yet in this range.</p>
        ) : (
          <>
            <p className="font-heading text-2xl font-bold">
              {pct}% done
              <span className="ml-2 font-sans text-base font-normal text-muted-foreground">
                {history.done} of {history.due} tasks
                {range.to > today && " so far"}
              </span>
            </p>
            {history.missed.length === 0 ? (
              <p className="mt-2 flex">
                <span className="flex items-center gap-2 rounded-full bg-primary px-3 py-0.5 text-sm font-medium text-primary-foreground">
                  <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={3} aria-hidden />
                  Nothing missed
                </span>
              </p>
            ) : (
              <div className="mt-3">
                <p className="flex items-center gap-2 font-medium text-destructive">
                  <HugeiconsIcon icon={Alert02Icon} className="size-5" strokeWidth={2} aria-hidden />
                  {history.missed.length === 1 ? "1 missed" : `${history.missed.length} missed`}
                </p>
                <ul className="mt-1 flex flex-col gap-0.5 text-sm">
                  {history.missed.slice(0, MISSED_SHOWN).map(({ date, item }) => (
                    <li key={`${date}:${item.key}`}>
                      <a href={`#day-${date}`} className="underline-offset-2 active:underline">
                        {formatDayDate(date)}, {formatLocalTime(item.time)}: {item.title}
                      </a>
                    </li>
                  ))}
                  {history.missed.length > MISSED_SHOWN && (
                    <li className="text-muted-foreground">and {history.missed.length - MISSED_SHOWN} more, listed by day below</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      {history.days.map((day) => (
        <section key={day.date} id={`day-${day.date}`} aria-labelledby={`h-${day.date}`} className="scroll-mt-16">
          <h2 id={`h-${day.date}`} className="mb-2 flex flex-wrap items-baseline gap-x-2 text-xl">
            {day.date === today ? "Today" : formatDayDate(day.date)}
            <span className="font-sans text-sm font-normal text-muted-foreground">
              {day.due === 0 ? "nothing due yet" : `${day.done} of ${day.due} done`}
              {day.missed > 0 && <span className="text-destructive"> · {day.missed} missed</span>}
            </span>
          </h2>
          {day.items.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-3 text-sm text-muted-foreground">No tasks scheduled.</p>
          ) : (
            <ul className="flex flex-col divide-y rounded-2xl border bg-card shadow-sm">
              {day.items.map((item) => (
                <Row key={item.key} item={item} pet={item.petId ? petName.get(item.petId) : undefined} />
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="text-sm text-muted-foreground">
        What was due is worked out from each task’s current schedule. Unticking a task on the Today screen removes its tick
        here too.
      </p>
    </div>
  );
}

const BADGE: Record<HistoryItem["status"], string> = {
  done: "bg-primary/20 text-foreground",
  missed: "bg-destructive/15 text-destructive",
  skipped: "bg-muted text-muted-foreground",
  upcoming: "bg-muted text-muted-foreground",
};

function Row({ item, pet }: { item: HistoryItem; pet?: string }) {
  const label =
    item.status === "done"
      ? item.completedAt
        ? `Done ${item.completedLate ? formatTimestamp(item.completedAt) : formatTimestampTime(item.completedAt)}`
        : "Done"
      : item.status === "missed"
        ? "Missed"
        : item.status === "skipped"
          ? "Skipped"
          : "Later today";
  return (
    <li className={cn("flex items-center gap-3 px-3 py-2.5", item.status === "missed" && "bg-destructive/5")}>
      <span className="w-16 shrink-0 text-sm tabular-nums text-muted-foreground">{formatLocalTime(item.time)}</span>
      <span className="min-w-0 flex-1">
        <span className="block leading-snug">{item.title}</span>
        {(pet || item.optional) && (
          <span className="block text-xs text-muted-foreground">
            {[pet, item.optional && "Optional"].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", BADGE[item.status])}>{label}</span>
    </li>
  );
}
