import { Suspense } from "react";
import { io } from "next/cache";
import {
  BookOpen01Icon,
  Call02Icon,
  Key01Icon,
  MapsLocation01Icon,
  PawPrintIcon,
  TaskDone01Icon,
  Wifi01Icon,
} from "@hugeicons/core-free-icons";

import { HomeTile } from "@/components/home/home-tile";
import { LiveClock } from "@/components/kiosk/live-clock";
import { requireGuest } from "@/lib/auth/access";
import {
  codes,
  contacts,
  getSettings,
  getStayOn,
  howtos,
  listCompletionsOn,
  pets,
  places,
  tasks,
} from "@/lib/db";
import { occurrencesOn, required } from "@/lib/schedule";
import {
  formatClock,
  formatLocalTime,
  formatLongDate,
  greeting,
  nowLocalTime,
  todayISO,
} from "@/lib/time";

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  // "Now" and the stored data are per-request; keep them out of the static shell.
  await io();
  await requireGuest();
  const now = new Date();
  const today = todayISO(now);
  const currentTime = nowLocalTime(now);

  const [settings, stay, petList, taskList, done, guideList, placeList, contactList, codeList] =
    await Promise.all([
      getSettings(),
      getStayOn(today),
      pets.list(),
      tasks.list(),
      listCompletionsOn(today),
      howtos.list(),
      places.list(),
      contacts.list(),
      codes.list(),
    ]);

  const todays = required(occurrencesOn(taskList, done, today));
  const remaining = todays.filter((o) => !o.done);
  const next = remaining.find((o) => o.time >= currentTime) ?? remaining[0];
  const overdue = remaining.filter((o) => o.time < currentTime).length;
  const checkingOutToday = stay?.endDate === today;

  return (
    <div className="flex flex-col gap-5 p-4 md:h-full md:gap-6 md:p-8">
      <header className="flex shrink-0 items-start justify-between gap-3 md:gap-8">
        <div className="min-w-0">
          <h1 className="text-2xl tracking-tight md:truncate md:text-5xl">
            {greeting(now)}
            {stay ? `, ${stay.guestName}` : ""}
          </h1>
          <p className="mt-1 text-base text-muted-foreground md:mt-2 md:truncate md:text-xl">
            {checkingOutToday
              ? `Check-out today by ${formatLocalTime(settings.checkOutTime)}`
              : `Welcome to ${settings.propertyName}`}
          </p>
        </div>
        <LiveClock initialTime={formatClock(now)} initialDate={formatLongDate(now)} />
      </header>

      <nav
        aria-label="Guide sections"
        className="grid grid-cols-2 gap-3 md:min-h-0 md:flex-1 md:grid-cols-4 md:grid-rows-2 md:gap-5"
      >
        <HomeTile
          href="/today"
          title="Today"
          icon={TaskDone01Icon}
          tone="bg-primary text-primary-foreground"
          className="col-span-2 md:col-span-1 md:row-span-2"
          subtitle={
            todays.length === 0
              ? "Nothing scheduled"
              : `${todays.length - remaining.length} of ${todays.length} done`
          }
        >
          <TodaySummary
            allDone={todays.length > 0 && remaining.length === 0}
            next={next && { time: formatLocalTime(next.time), title: next.task.title }}
            overdue={overdue}
          />
        </HomeTile>

        <HomeTile
          href="/pets"
          title="Pets"
          icon={PawPrintIcon}
          tone="bg-chart-1/15 text-chart-1"
          subtitle={listNames(petList.map((p) => p.name)) || "Meet the pets"}
        />
        <HomeTile
          href="/guide"
          title="Home Guide"
          icon={BookOpen01Icon}
          tone="bg-chart-2/15 text-chart-2"
          subtitle={countLabel(guideList.length, "guide")}
        />
        <HomeTile
          href="/orlando"
          title="Orlando"
          icon={MapsLocation01Icon}
          tone="bg-chart-3/15 text-chart-3"
          subtitle={countLabel(placeList.length, "place") + " nearby"}
        />
        <HomeTile
          href="/wifi"
          title="Wi-Fi"
          icon={Wifi01Icon}
          tone="bg-chart-4/15 text-chart-4"
          subtitle={settings.wifi.ssid}
        />
        <HomeTile
          href="/contacts"
          title="Contacts"
          icon={Call02Icon}
          tone="bg-chart-5/15 text-chart-5"
          subtitle={
            contactList.some((c) => c.emergency) ? "Host & emergency" : countLabel(contactList.length, "contact")
          }
        />
        {/* Code values are never shown on Home — only on the Codes screen. */}
        <HomeTile
          href="/codes"
          title="Codes"
          icon={Key01Icon}
          tone="bg-muted text-foreground"
          subtitle={listNames(codeList.map((c) => c.label)) || "Door codes"}
        />
      </nav>
    </div>
  );
}

function TodaySummary({
  allDone,
  next,
  overdue,
}: {
  allDone: boolean;
  next?: { time: string; title: string };
  overdue: number;
}) {
  if (allDone) {
    return <p className="mt-auto font-heading text-lg font-bold md:text-2xl">All done for today. Thank you!</p>;
  }
  if (!next) return null;
  return (
    <div className="mt-auto flex flex-col gap-2 md:gap-3">
      {overdue > 0 && (
        <p className="w-fit rounded-full bg-destructive/15 px-3 py-0.5 text-base font-medium text-destructive md:px-4 md:py-1 md:text-lg">
          {overdue} overdue
        </p>
      )}
      <div className="rounded-2xl bg-muted p-3 md:p-4">
        <p className="text-sm text-muted-foreground md:text-lg">Up next</p>
        <p className="text-base font-medium tabular-nums md:text-xl">{next.time}</p>
        <p className="font-heading text-lg font-bold md:text-2xl">{next.title}</p>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4 md:h-full md:gap-6 md:p-8" aria-busy>
      <div className="h-16 shrink-0 animate-pulse rounded-3xl bg-muted md:h-24" />
      <div className="grid grid-cols-2 gap-3 md:min-h-0 md:flex-1 md:grid-cols-4 md:grid-rows-2 md:gap-5">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={
              i === 0
                ? "col-span-2 animate-pulse rounded-3xl bg-muted md:col-span-1 md:row-span-2"
                : "min-h-32 animate-pulse rounded-3xl bg-muted"
            }
          />
        ))}
      </div>
    </div>
  );
}

function countLabel(n: number, noun: string) {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

function listNames(names: string[]) {
  if (names.length <= 2) return names.join(" & ");
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}
