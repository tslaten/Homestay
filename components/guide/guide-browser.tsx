"use client";

import { useState } from "react";
import {
  BookOpen01Icon,
  FirstAidKitIcon,
  PawPrintIcon,
  ThermometerIcon,
  TreePalmIcon,
  Tv01Icon,
  WashingMachineIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import type { HowTo } from "@/lib/types";
import { cn } from "@/lib/utils";

export type GuideView = Pick<HowTo, "id" | "title" | "category" | "summary" | "steps">;

// Display order of categories in the list (guides keep their own `order` within each).
const CATEGORIES: { id: HowTo["category"]; label: string; icon: IconSvgElement }[] = [
  { id: "pets", label: "Cats", icon: PawPrintIcon },
  { id: "safety", label: "Safety", icon: FirstAidKitIcon },
  { id: "climate", label: "Heating & cooling", icon: ThermometerIcon },
  { id: "appliances", label: "Appliances", icon: WashingMachineIcon },
  { id: "entertainment", label: "TV & entertainment", icon: Tv01Icon },
  { id: "outdoor", label: "Outdoors", icon: TreePalmIcon },
  { id: "other", label: "Around the house", icon: BookOpen01Icon },
];

const categoryOf = (id: HowTo["category"]) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES.at(-1)!;

export function GuideBrowser({ guides }: { guides: GuideView[] }) {
  const groups = CATEGORIES.map((c) => ({ ...c, guides: guides.filter((g) => categoryOf(g.category).id === c.id) })).filter(
    (g) => g.guides.length > 0,
  );
  const ordered = groups.flatMap((g) => g.guides);

  const [selectedId, setSelectedId] = useState(ordered[0]?.id);
  const guide = ordered.find((g) => g.id === selectedId) ?? ordered[0];

  return (
    <div className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:flex-row md:gap-6">
      {/* Phones: every guide as a wrapping row of buttons (no category headings). */}
      <nav
        aria-label="Guides"
        className="flex shrink-0 flex-wrap gap-2 p-1 md:w-80 md:flex-col md:flex-nowrap md:overflow-y-auto md:overscroll-contain"
      >
        {groups.map((group) => (
          <div key={group.id} className="contents md:flex md:flex-col md:gap-2">
            <h2 className="mt-2 hidden items-center gap-2 px-2 font-sans text-lg font-normal text-muted-foreground first:mt-0 md:flex">
              <HugeiconsIcon icon={group.icon} className="size-6" strokeWidth={2} aria-hidden />
              {group.label}
            </h2>
            {group.guides.map((g) => {
              const selected = g.id === guide.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  onClick={() => setSelectedId(g.id)}
                  className={cn(
                    "flex min-h-12 items-center rounded-2xl border px-4 py-2 text-left font-heading text-base font-bold md:min-h-touch md:px-5 md:py-3 md:text-xl",
                    "touch-manipulation transition-[transform,background-color] duration-100 active:scale-[0.98]",
                    "outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-card shadow-sm active:bg-accent",
                  )}
                >
                  {g.title}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <article key={guide.id} className="p-1 md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain">
        <GuideDetails guide={guide} />
      </article>
    </div>
  );
}

function GuideDetails({ guide }: { guide: GuideView }) {
  const category = categoryOf(guide.category);
  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="flex items-center gap-4 md:gap-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-chart-2/15 text-chart-2 md:size-20 md:rounded-3xl" aria-hidden>
          <HugeiconsIcon icon={category.icon} className="size-8 md:size-11" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-3xl md:text-5xl">{guide.title}</h2>
          <p className="text-base text-muted-foreground md:text-xl">{category.label}</p>
        </div>
      </div>

      {guide.summary && <p className="text-lg leading-snug md:text-2xl">{guide.summary}</p>}

      <ol className="flex flex-col gap-3">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 rounded-3xl border bg-card p-4 shadow-sm md:gap-5 md:p-5">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground md:size-12 md:text-2xl"
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="pt-1 text-lg leading-snug md:pt-1.5 md:text-2xl">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
