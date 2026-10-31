import { Suspense } from "react";
import Link from "next/link";
import { Edit02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { movePet } from "./actions";
import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/access";
import { pets, tasks } from "@/lib/db";

export const metadata = { title: "Pets · Guest Guide admin" };

export default function PetsAdminPage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl">Pets</h1>
        <Button asChild size="compact">
          <Link href="/admin/pets/new">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} aria-hidden />
            Add pet
          </Link>
        </Button>
      </div>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted" />}>
        <PetList />
      </Suspense>
    </>
  );
}

async function PetList() {
  await requireAdmin();
  const [list, taskList] = await Promise.all([pets.list(), tasks.list()]);

  if (list.length === 0) {
    return <p className="rounded-2xl border border-dashed p-4 text-muted-foreground">No pets yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {list.map((p, i) => {
        const count = taskList.filter((t) => t.petId === p.id).length;
        return (
          <li key={p.id} className="flex items-center gap-2 rounded-2xl border bg-card p-3 shadow-sm">
            <Link href={`/admin/pets/${p.id}`} className="min-w-0 flex-1 rounded-md p-1 active:bg-accent">
              <span className="block font-heading font-bold">{p.name}</span>
              <span className="block truncate text-sm text-muted-foreground">
                {p.species[0].toUpperCase() + p.species.slice(1)}
                {p.breed && ` · ${p.breed}`} · {count === 1 ? "1 task" : `${count} tasks`}
              </span>
            </Link>
            <ReorderButtons id={p.id} label={p.name} action={movePet} first={i === 0} last={i === list.length - 1} />
            <Button asChild size="compact" variant="outline" aria-label={`Edit ${p.name}`}>
              <Link href={`/admin/pets/${p.id}`}>
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} aria-hidden />
              </Link>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
