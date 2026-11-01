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
      <main className="flex flex-col px-4 pt-4 pb-6 md:min-h-0 md:flex-1 md:px-8 md:pt-0">
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
        <p className="py-16 text-center text-2xl text-muted-foreground md:py-0 md:text-3xl">No pets to look after on this stay.</p>
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
      hidingSpots: p.hidingSpots,
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
    <div className="flex flex-1 flex-col gap-4 md:flex-row md:gap-6" aria-busy>
      <div className="flex gap-3 md:w-64 md:flex-col">
        <div className="h-22 animate-pulse rounded-3xl bg-muted" />
        <div className="h-22 animate-pulse rounded-3xl bg-muted" />
      </div>
      <div className="flex flex-1 flex-col gap-5">
        <div className="h-28 animate-pulse rounded-3xl bg-muted md:w-96" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-3xl bg-muted" />
          <div className="h-48 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
