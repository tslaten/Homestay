"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight01Icon,
  BirdIcon,
  CatIcon,
  FishIcon,
  Medicine02Icon,
  PawPrintIcon,
  Search01Icon,
  SpoonAndForkIcon,
  StethoscopeIcon,
  TaskDaily01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { PhoneLink } from "@/components/kiosk/phone-link";
import { Button } from "@/components/ui/button";
import type { Pet } from "@/lib/types";
import { cn } from "@/lib/utils";

/** A pet plus everything the screen shows about it, pre-formatted on the server. */
export interface PetView {
  id: string;
  name: string;
  species: Pet["species"];
  breed?: string;
  photoUrl?: string;
  about: string;
  feeding: string;
  medical?: string;
  hidingSpots?: string[];
  vet?: { name: string; phone?: string };
  today: { key: string; timeLabel: string; title: string; done: boolean; optional?: boolean }[];
}

const SPECIES: Record<Pet["species"], { label: string; icon: IconSvgElement }> = {
  dog: { label: "Dog", icon: PawPrintIcon },
  cat: { label: "Cat", icon: CatIcon },
  bird: { label: "Bird", icon: BirdIcon },
  fish: { label: "Fish", icon: FishIcon },
  other: { label: "Pet", icon: PawPrintIcon },
};

export function PetBrowser({ pets }: { pets: PetView[] }) {
  const [selectedId, setSelectedId] = useState(pets[0]?.id);
  const pet = pets.find((p) => p.id === selectedId) ?? pets[0];

  return (
    <div className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:flex-row md:gap-6">
      {/* With one pet there is nothing to choose, so skip the picker. */}
      {pets.length > 1 && (
        <div
          role="tablist"
          className="flex shrink-0 gap-2 overflow-x-auto p-1 md:w-64 md:flex-col md:gap-3 md:overflow-x-visible md:overflow-y-auto"
        >
          {pets.map((p) => {
            const selected = p.id === pet.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "flex min-h-touch shrink-0 items-center gap-3 rounded-3xl border p-2 pr-5 text-left md:gap-4 md:p-3",
                  "touch-manipulation transition-[transform,background-color] duration-100 active:scale-[0.98]",
                  "outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "bg-card shadow-sm active:bg-accent",
                )}
              >
                <PetAvatar pet={p} className="size-10 md:size-16" inverted={selected} />
                <span className="truncate font-heading text-lg font-bold md:text-2xl">{p.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <section
        key={pet.id}
        role={pets.length > 1 ? "tabpanel" : undefined}
        aria-label={pet.name}
        className="p-1 md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain"
      >
        <PetDetails pet={pet} />
      </section>
    </div>
  );
}

function PetDetails({ pet }: { pet: PetView }) {
  const species = SPECIES[pet.species];
  const counted = pet.today.filter((t) => !t.optional);
  const doneCount = counted.filter((t) => t.done).length;

  const feeding = (
    <InfoCard icon={SpoonAndForkIcon} title="Feeding">
      <p className="text-base leading-snug md:text-xl">{pet.feeding}</p>
    </InfoCard>
  );

  const today = (
    <InfoCard
      icon={TaskDaily01Icon}
      title="Today"
      aside={counted.length > 0 ? `${doneCount} of ${counted.length} done` : undefined}
    >
      {pet.today.length === 0 ? (
        <p className="text-base text-muted-foreground md:text-xl">Nothing scheduled today.</p>
      ) : (
        // Read-only status: ticking happens on the Today screen, so nothing here looks like a checkbox.
        <ul className="flex flex-col gap-2">
          {pet.today.map((t) => (
            <li key={t.key} className="flex items-baseline gap-3 text-base md:text-xl">
              <span className="w-20 shrink-0 tabular-nums text-muted-foreground md:w-24">{t.timeLabel}</span>
              <span className={cn("min-w-0 flex-1", t.done && "text-muted-foreground line-through")}>
                {t.title}
                {t.optional && <span className="text-muted-foreground"> (optional)</span>}
              </span>
              {t.done && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="size-5 shrink-0 self-center text-primary md:size-7"
                  strokeWidth={3}
                  aria-label="Done"
                />
              )}
            </li>
          ))}
        </ul>
      )}
      <Button asChild variant="secondary" className="mt-4 w-full">
        <Link href="/today">
          Open today’s checklist
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} aria-hidden />
        </Link>
      </Button>
    </InfoCard>
  );

  const hiding = pet.hidingSpots && pet.hidingSpots.length > 0 && (
    <InfoCard icon={Search01Icon} title="Hiding spots">
      <ul className="flex list-disc flex-col gap-1 pl-5 text-base leading-snug md:pl-6 md:text-xl">
        {pet.hidingSpots.map((spot) => (
          <li key={spot}>{spot}</li>
        ))}
      </ul>
    </InfoCard>
  );

  const medical = pet.medical && (
    <InfoCard icon={Medicine02Icon} title="Medical">
      <p className="text-base leading-snug md:text-xl">{pet.medical}</p>
    </InfoCard>
  );

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <PetAvatar pet={pet} className="size-16 md:size-24" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-3xl md:text-5xl">{pet.name}</h2>
          <p className="text-base text-muted-foreground md:text-xl">
            {species.label}
            {pet.breed && ` · ${pet.breed}`}
          </p>
        </div>
        {/* The vet sits in the header so the number is always on screen without scrolling. */}
        {pet.vet && (
          <div className="flex w-full items-center gap-3 rounded-3xl border bg-card px-4 py-3 shadow-sm md:w-auto md:shrink-0 md:gap-4 md:px-5 md:py-4">
            <HugeiconsIcon icon={StethoscopeIcon} className="size-7 shrink-0 text-muted-foreground md:size-9" strokeWidth={2} aria-hidden />
            <div>
              <p className="text-sm text-muted-foreground md:text-lg">Vet · {pet.vet.name}</p>
              {pet.vet.phone && (
                <p data-selectable className="font-heading text-2xl font-bold tabular-nums md:text-3xl">
                  <PhoneLink phone={pet.vet.phone} />
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-lg leading-snug md:text-2xl">{pet.about}</p>

      {/* Two independent stacks so a tall card never leaves a gap beside it. */}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          {feeding}
          {medical}
          {/* Hiding spots go in whichever column is shorter. */}
          {!medical && hiding}
        </div>
        <div className="flex flex-col gap-4">
          {today}
          {medical && hiding}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  aside,
  children,
}: {
  icon: IconSvgElement;
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm md:p-5">
      <h3 className="mb-2 flex items-center gap-2 md:mb-3 md:gap-3">
        <HugeiconsIcon icon={icon} className="size-6 text-muted-foreground md:size-7" strokeWidth={2} aria-hidden />
        {title}
        {aside && <span className="ml-auto font-sans text-sm font-normal text-muted-foreground md:text-lg">{aside}</span>}
      </h3>
      {children}
    </div>
  );
}

function PetAvatar({ pet, className, inverted }: { pet: PetView; className?: string; inverted?: boolean }) {
  if (pet.photoUrl) {
    return (
      // Photos are arbitrary URLs entered by the host, so skip next/image's domain allow-list.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={pet.photoUrl} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        inverted ? "bg-primary-foreground/20 text-primary-foreground" : "bg-chart-1/15 text-chart-1",
        className,
      )}
      aria-hidden
    >
      <HugeiconsIcon icon={SPECIES[pet.species].icon} className="size-1/2" strokeWidth={2} />
    </span>
  );
}
