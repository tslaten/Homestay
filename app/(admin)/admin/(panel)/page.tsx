import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  CheckListIcon,
  Calendar03Icon,
  ContactBookIcon,
  Key01Icon,
  Location01Icon,
  PawPrintIcon,
  Settings02Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { requireAdmin } from "@/lib/auth/access";
import { codes, contacts, getSettings, howtos, listCompletionsOn, pets, places, stays, tasks } from "@/lib/db";
import { buildHistory } from "@/lib/history";
import { formatDateRange, nowLocalTime, todayISO } from "@/lib/time";

export const metadata = { title: "Guest Guide admin" };

export default function AdminHome() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Admin</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

async function DashboardContent() {
  await requireAdmin();
  const now = new Date();
  const today = todayISO(now);
  const [settings, stayList, taskList, petList, placeList, guideList, contactList, codeList, todayTicks] = await Promise.all([
    getSettings(),
    stays.list(),
    tasks.list(),
    pets.list(),
    places.list(),
    howtos.list(),
    contacts.list(),
    codes.list(),
    listCompletionsOn(today),
  ]);
  const activeTasks = taskList.filter((t) => t.active).length;
  // Current stay, else the next one coming up.
  const stay = stayList.find((s) => s.endDate >= today);
  const picks = placeList.filter((p) => p.favorite).length;
  const [todayLog] = buildHistory({ tasks: taskList, completions: todayTicks, from: today, to: today, today, now: nowLocalTime(now) }).days;

  return (
    <div className="flex flex-col gap-3">
      <Tile
        href="/admin/stays"
        icon={Calendar03Icon}
        title="Stays"
        detail={
          stay
            ? `${stay.startDate <= today ? "Now" : "Next"}: ${stay.guestName}, ${formatDateRange(stay.startDate, stay.endDate)}`
            : "None coming up"
        }
      />
      <Tile
        href="/admin/tasks"
        icon={Task01Icon}
        title="Tasks"
        detail={`${activeTasks} active${taskList.length > activeTasks ? `, ${taskList.length - activeTasks} paused` : ""}`}
      />
      <Tile
        href="/admin/history"
        icon={CheckListIcon}
        title="History"
        detail={
          !stay || stay.startDate > today
            ? "Starts with the next stay"
            : todayLog.due === 0
              ? "Today: nothing due yet"
              : `Today: ${todayLog.done} of ${todayLog.due} done${todayLog.missed ? ` · ${todayLog.missed} missed` : ""}`
        }
      />
      <Tile href="/admin/pets" icon={PawPrintIcon} title="Pets" detail={petList.map((p) => p.name).join(" & ") || "None yet"} />
      <Tile
        href="/admin/places"
        icon={Location01Icon}
        title="Places"
        detail={`${count(placeList.length, "place")}${picks ? ` · ${count(picks, "host’s pick")}` : ""}`}
      />
      <Tile href="/admin/guides" icon={BookOpen01Icon} title="Home guide" detail={count(guideList.length, "guide")} />
      <Tile href="/admin/contacts" icon={ContactBookIcon} title="Contacts" detail={count(contactList.length, "contact")} />
      <Tile href="/admin/codes" icon={Key01Icon} title="Codes" detail={codeList.map((c) => c.label).join(", ") || "None yet"} />
      <Tile
        href="/admin/settings"
        icon={Settings02Icon}
        title="Settings"
        detail={`${settings.propertyName} · Wi-Fi “${settings.wifi.ssid}”`}
      />
    </div>
  );
}

function Tile({ href, icon, title, detail }: { href: string; icon: IconSvgElement; title: string; detail: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm active:bg-accent">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted" aria-hidden>
        <HugeiconsIcon icon={icon} className="size-6" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-lg font-bold">{title}</span>
        <span className="block truncate text-sm text-muted-foreground">{detail}</span>
      </span>
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-5 text-muted-foreground" strokeWidth={2} aria-hidden />
    </Link>
  );
}
