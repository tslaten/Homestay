import { Suspense } from "react";
import { requireGuest } from "@/lib/auth/access";
import { io } from "next/cache";

import { ScreenHeader } from "@/components/kiosk/screen-header";
import { PetBrowser, type PetView } from "@/components/pets/pet-browser";
import { contacts, listCompletionsOn, pets, tasks } from "@/lib/db";
import { occurrencesOn } from "@/lib/schedule";
import { formatLocalTime, todayISO } from "@/lib/time";

export default function PetsPage() {
  return (
    <>
      <ScreenHeader title="Pets" />
      <main className="flex min-h-0 flex-1 flex-col px-8 pb-6">
        <Suspense fallback={<PetsSkeleton />}>
          <PetsContent />
        </Suspense>
      </main>
    </>
  );
}

async function PetsContent() {
  await io();
  await requireGuest();
  const today = todayISO();

  const [petList, taskList, contactList, done] = await Promise.all([
    pets.list(),
    tasks.list(),
    contacts.list(),
    listCompletionsOn(today),
  ]);

  if (petList.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-center text-3xl text-muted-foreground">No pets to look after on this stay.</p>
      </div>
    );
  }

  const contactById = new Map(contactList.map((c) => [c.id, c]));
  const todays = occurrencesOn(taskList, done, today);

  const views: PetView[] = petList.map((p) => {
    const vet = p.vetContactId ? contactById.get(p.vetContactId) : undefined;
    return {
      id: p.id,
      name: p.name,
      species: p.species,
      breed: p.breed,
      photoUrl: p.photoUrl,
      about: p.about,
      feeding: p.feeding,
      medical: p.medical,
      vet: vet && { name: vet.name, phone: vet.phone },
      today: todays
        .filter((o) => o.task.petId === p.id)
        .map((o) => ({
          key: `${o.task.id}@${o.time}`,
          timeLabel: formatLocalTime(o.time),
          title: o.task.title,
          done: o.done,
          optional: o.task.optional,
        })),
    };
  });

  return <PetBrowser pets={views} />;
}

function PetsSkeleton() {
  return (
    <div className="flex flex-1 gap-6" aria-busy>
      <div className="flex w-64 flex-col gap-3">
        <div className="h-22 animate-pulse rounded-3xl bg-muted" />
        <div className="h-22 animate-pulse rounded-3xl bg-muted" />
      </div>
      <div className="flex flex-1 flex-col gap-5">
        <div className="h-28 w-96 animate-pulse rounded-3xl bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 animate-pulse rounded-3xl bg-muted" />
          <div className="h-48 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
