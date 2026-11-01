import { Suspense } from "react";
import { requireGuest } from "@/lib/auth/access";
import { io } from "next/cache";
import { Logout03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ScreenHeader } from "@/components/kiosk/screen-header";
import { TaskChecklist, type ChecklistItem } from "@/components/today/task-checklist";
import { getSettings, getStayOn, listCompletionsOn, pets, tasks } from "@/lib/db";
import { occurrencesOn } from "@/lib/schedule";
import {
  formatLocalTime,
  formatLongDate,
  formatTimestampTime,
  nowLocalTime,
  todayISO,
} from "@/lib/time";

export default function TodayPage() {
  return (
    <>
      <ScreenHeader title="Today">
        <Suspense>
          <HeaderDate />
        </Suspense>
      </ScreenHeader>
      <Suspense fallback={<ChecklistSkeleton />}>
        <TodayContent />
      </Suspense>
    </>
  );
}

async function HeaderDate() {
  await io();
  return <p className="text-xl text-muted-foreground">{formatLongDate(new Date())}</p>;
}

async function TodayContent() {
  await io();
  await requireGuest();
  const now = new Date();
  const today = todayISO(now);

  const [settings, stay, taskList, petList, done] = await Promise.all([
    getSettings(),
    getStayOn(today),
    tasks.list(),
    pets.list(),
    listCompletionsOn(today),
  ]);

  const petNames = new Map(petList.map((p) => [p.id, p.name]));
  const completedAt = new Map(done.map((c) => [`${c.taskId}@${c.time}`, c.completedAt]));

  const items: ChecklistItem[] = occurrencesOn(taskList, done, today).map((o) => {
    const at = completedAt.get(`${o.task.id}@${o.time}`);
    return {
      key: `${o.task.id}@${o.time}`,
      taskId: o.task.id,
      date: o.date,
      time: o.time,
      timeLabel: formatLocalTime(o.time),
      title: o.task.title,
      details: o.task.details,
      petName: o.task.petId ? petNames.get(o.task.petId) : undefined,
      optional: o.task.optional,
      done: o.done,
      doneLabel: at ? formatTimestampTime(at) : undefined,
    };
  });

  return (
    <main className="flex flex-col gap-4 px-4 pt-4 pb-6 md:min-h-0 md:flex-1 md:gap-5 md:px-8 md:pt-0">
      {stay?.endDate === today && (
        <p className="flex shrink-0 items-center gap-3 rounded-3xl bg-primary px-4 py-3 font-heading text-lg font-bold text-primary-foreground md:gap-4 md:px-6 md:py-4 md:text-2xl">
          <HugeiconsIcon icon={Logout03Icon} className="size-6 shrink-0 md:size-8" strokeWidth={2} aria-hidden />
          Check-out today by {formatLocalTime(settings.checkOutTime)}
        </p>
      )}

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="py-16 text-center text-2xl text-muted-foreground md:py-0 md:text-3xl">Nothing to do today. Enjoy!</p>
        </div>
      ) : (
        <TaskChecklist items={items} currentTime={nowLocalTime(now)} />
      )}
    </main>
  );
}

function ChecklistSkeleton() {
  return (
    <main className="grid grid-cols-1 content-start gap-3 px-4 pt-4 pb-6 md:min-h-0 md:flex-1 md:grid-cols-3 md:gap-4 md:px-9 md:pt-0" aria-busy>
      <div className="col-span-full h-10 w-48 animate-pulse rounded-2xl bg-muted md:w-64" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />
      ))}
    </main>
  );
}
