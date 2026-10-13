"use client";

import { useState } from "react";
import {
  BookOpen01Icon,
  FirstAidKitIcon,
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
  { id: "safety", label: "Safety", icon: FirstAidKitIcon },
  { id: "climate", label: "Heating & cooling", icon: ThermometerIcon },
  { id: "appliances", label: "Appliances", icon: WashingMachineIcon },
  { id: "entertainment", label: "TV & entertainment", icon: Tv01Icon },
  { id: "outdoor", label: "Outdoors", icon: TreePalmIcon },
  { id: "other", label: "Other", icon: BookOpen01Icon },
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
    <div className="flex min-h-0 flex-1 gap-6">
      <nav aria-label="Guides" className="flex w-80 shrink-0 flex-col gap-2 overflow-y-auto overscroll-contain p-1">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-2">
            <h2 className="mt-2 flex items-center gap-2 px-2 font-sans text-lg font-normal text-muted-foreground first:mt-0">
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
                    "flex min-h-touch items-center rounded-2xl border px-5 py-3 text-left font-heading text-xl font-bold",
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

      <article key={guide.id} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
        <GuideDetails guide={guide} />
      </article>
    </div>
  );
}

function GuideDetails({ guide }: { guide: GuideView }) {
  const category = categoryOf(guide.category);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-chart-2/15 text-chart-2" aria-hidden>
          <HugeiconsIcon icon={category.icon} className="size-11" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-5xl">{guide.title}</h2>
          <p className="text-xl text-muted-foreground">{category.label}</p>
        </div>
      </div>

      {guide.summary && <p className="text-2xl leading-snug">{guide.summary}</p>}

      <ol className="flex flex-col gap-3">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-5 rounded-3xl border bg-card p-5 shadow-sm">
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-2xl font-bold text-primary-foreground"
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="pt-1.5 text-2xl leading-snug">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
