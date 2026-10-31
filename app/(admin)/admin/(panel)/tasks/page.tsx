import { Suspense } from "react";
import Link from "next/link";
import { Edit02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { moveTask } from "./actions";
import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/access";
import { pets, tasks } from "@/lib/db";
import { describeSchedule } from "@/lib/schedule";

export const metadata = { title: "Tasks · Guest Guide admin" };

export default function TasksPage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl">Tasks</h1>
        <Button asChild size="compact">
          <Link href="/admin/tasks/new">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} aria-hidden />
            Add task
          </Link>
        </Button>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
        <TaskList />
      </Suspense>
    </>
  );
}

async function TaskList() {
  await requireAdmin();
  const [list, petList] = await Promise.all([tasks.list(), pets.list()]);
  const petName = new Map(petList.map((p) => [p.id, p.name]));

  if (list.length === 0) {
    return <p className="rounded-2xl border border-dashed p-4 text-muted-foreground">No tasks yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {list.map((t, i) => (
        <li key={t.id} className="flex items-center gap-2 rounded-2xl border bg-card p-3 shadow-sm">
          <Link href={`/admin/tasks/${t.id}`} className="min-w-0 flex-1 rounded-md p-1 active:bg-accent">
            <span className="flex flex-wrap items-center gap-2 font-heading font-bold">
              {t.title}
              {t.optional && <Badge>Optional</Badge>}
              {!t.active && <Badge>Paused</Badge>}
            </span>
            <span className="block text-sm text-muted-foreground">
              {describeSchedule(t.schedule)}
              {t.petId && ` · ${petName.get(t.petId) ?? "Removed pet"}`}
            </span>
          </Link>
          <ReorderButtons id={t.id} label={t.title} action={moveTask} first={i === 0} last={i === list.length - 1} />
          <Button asChild size="compact" variant="outline" aria-label={`Edit ${t.title}`}>
            <Link href={`/admin/tasks/${t.id}`}>
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} aria-hidden />
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-muted px-2 text-xs font-normal text-muted-foreground">{children}</span>;
}
