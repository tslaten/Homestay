"use client";

import { useState } from "react";
import {
  ArrowDown01Icon,
  Call02Icon,
  Car01Icon,
  Coffee01Icon,
  FerrisWheelIcon,
  Globe02Icon,
  Hospital01Icon,
  Location01Icon,
  Navigation03Icon,
  PillIcon,
  Restaurant01Icon,
  ShoppingBag01Icon,
  ShoppingBasket01Icon,
  SmartPhone01Icon,
  StarIcon,
  Tree06Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { PhoneLink } from "@/components/kiosk/phone-link";
import { Button } from "@/components/ui/button";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PlaceView = Pick<
  Place,
  "id" | "name" | "category" | "description" | "address" | "driveMinutes" | "phone" | "url" | "favorite"
> & {
  /** Server-rendered SVG of a QR code linking to directions. */
  qrSvg: string;
  /** Google Maps directions link (the same one the QR code encodes). */
  directionsUrl: string;
};

const CATEGORIES: Record<Place["category"], { label: string; icon: IconSvgElement }> = {
  food: { label: "Food", icon: Restaurant01Icon },
  coffee: { label: "Coffee", icon: Coffee01Icon },
  grocery: { label: "Groceries", icon: ShoppingBasket01Icon },
  pharmacy: { label: "Pharmacy", icon: PillIcon },
  park: { label: "Parks", icon: Tree06Icon },
  attraction: { label: "Attractions", icon: FerrisWheelIcon },
  shopping: { label: "Shopping", icon: ShoppingBag01Icon },
  medical: { label: "Medical", icon: Hospital01Icon },
};

type Filter = "all" | "favorites" | Place["category"];

export function PlaceBrowser({ places }: { places: PlaceView[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(places[0]?.id);
  // Phones: the tapped place expands inline in the list; tap again to collapse.
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = places.filter((p) =>
    filter === "all" ? true : filter === "favorites" ? p.favorite : p.category === filter,
  );
  const place = visible.find((p) => p.id === selectedId) ?? visible[0];

  const chips: { id: Filter; label: string; icon?: IconSvgElement }[] = [
    { id: "all", label: "All" },
    ...(places.some((p) => p.favorite) ? [{ id: "favorites" as const, label: "Host’s picks", icon: StarIcon }] : []),
    ...(Object.keys(CATEGORIES) as Place["category"][])
      .filter((c) => places.some((p) => p.category === c))
      .map((c) => ({ id: c, label: CATEGORIES[c].label, icon: CATEGORIES[c].icon })),
  ];

  return (
    <div className="flex flex-col gap-3 md:min-h-0 md:flex-1 md:gap-4">
      <div role="toolbar" aria-label="Filter places" className="flex shrink-0 flex-wrap gap-2 p-1 md:flex-nowrap md:gap-3 md:overflow-x-auto">
        {chips.map((chip) => {
          const active = chip.id === filter;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(chip.id)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-heading text-base font-bold whitespace-nowrap md:min-h-touch md:px-5 md:text-lg",
                "touch-manipulation transition-[transform,background-color] duration-100 active:scale-[0.97]",
                "outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-card active:bg-accent",
              )}
            >
              {chip.icon && <HugeiconsIcon icon={chip.icon} className="size-5 md:size-6" strokeWidth={2} aria-hidden />}
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:flex-row md:gap-6">
        {/* Phones: a vertical list where the tapped place expands in place. Echo Show: list + detail pane. */}
        <ul
          aria-label="Places"
          className="flex shrink-0 flex-col gap-2 p-1 md:w-96 md:overflow-y-auto md:overscroll-contain"
        >
          {visible.map((p) => {
            const selected = p.id === place?.id;
            const open = p.id === openId;
            const cat = CATEGORIES[p.category];
            return (
              <li key={p.id} className="w-full">
                <button
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  aria-expanded={open}
                  onClick={() => {
                    setSelectedId(p.id);
                    setOpenId(open ? null : p.id);
                  }}
                  className={cn(
                    "flex min-h-touch w-full items-center gap-3 rounded-2xl border p-2 text-left md:gap-4 md:p-3",
                    "touch-manipulation transition-[transform,background-color] duration-100 active:scale-[0.98]",
                    "outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
                    "bg-card shadow-sm active:bg-accent",
                    open && "max-md:border-primary max-md:bg-primary max-md:text-primary-foreground",
                    selected && "md:border-primary md:bg-primary md:text-primary-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-3/15 text-chart-3 md:size-12",
                      open && "max-md:bg-primary-foreground/20 max-md:text-primary-foreground",
                      selected && "md:bg-primary-foreground/20 md:text-primary-foreground",
                    )}
                    aria-hidden
                  >
                    <HugeiconsIcon icon={cat.icon} className="size-6 md:size-7" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-base font-bold md:text-xl">{p.name}</span>
                    <span
                      className={cn(
                        "block text-sm text-muted-foreground md:text-lg",
                        open && "max-md:text-primary-foreground max-md:opacity-85",
                        selected && "md:text-primary-foreground md:opacity-85",
                      )}
                    >
                      {cat.label}
                      {p.driveMinutes != null && ` · ${p.driveMinutes} min`}
                    </span>
                  </span>
                  {p.favorite && (
                    <HugeiconsIcon icon={StarIcon} className="size-6 shrink-0" strokeWidth={2} aria-label="Host’s pick" />
                  )}
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className={cn("size-5 shrink-0 transition-transform md:hidden", open && "rotate-180")}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
                {open && (
                  <div className="px-2 pt-3 pb-2 md:hidden">
                    <PlaceDetails place={p} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {place && (
          <article key={place.id} className="hidden p-1 md:block md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain">
            <PlaceDetails place={place} />
          </article>
        )}
      </div>
    </div>
  );
}

function PlaceDetails({ place }: { place: PlaceView }) {
  const cat = CATEGORIES[place.category];
  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
        <div>
          <h2 className="text-3xl leading-tight md:text-4xl">{place.name}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-base text-muted-foreground md:text-xl">
            {cat.label}
            {place.favorite && (
              <span className="flex items-center gap-1 rounded-full bg-chart-4/25 px-3 text-sm text-foreground md:text-lg">
                <HugeiconsIcon icon={StarIcon} className="size-5" strokeWidth={2} aria-hidden />
                Host’s pick
              </span>
            )}
          </p>
        </div>

        <p className="text-lg leading-snug md:text-2xl">{place.description}</p>

        <dl className="flex flex-col gap-3 text-base md:text-xl">
          {place.driveMinutes != null && (
            <InfoRow icon={Car01Icon} label="Drive">
              About {place.driveMinutes} min by car
            </InfoRow>
          )}
          {place.address && (
            <InfoRow icon={Location01Icon} label="Address">
              <span data-selectable>{place.address}</span>
            </InfoRow>
          )}
          {place.phone && (
            <InfoRow icon={Call02Icon} label="Phone">
              <span data-selectable className="tabular-nums">
                <PhoneLink phone={place.phone} />
              </span>
            </InfoRow>
          )}
          {place.url && (
            <InfoRow icon={Globe02Icon} label="Website">
              <span data-selectable className="break-all">
                {place.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </span>
            </InfoRow>
          )}
        </dl>

        {/* On a phone the QR code can't be scanned by the same phone, so link straight to directions. */}
        <Button asChild size="compact" className="self-start md:hidden">
          <a href={place.directionsUrl} target="_blank" rel="noopener noreferrer">
            <HugeiconsIcon icon={Navigation03Icon} strokeWidth={2} aria-hidden />
            Directions
          </a>
        </Button>
      </div>

      <div className="hidden w-64 shrink-0 flex-col items-center gap-3 self-start rounded-3xl border bg-card p-5 shadow-sm md:flex">
        <div
          className="size-52 rounded-2xl bg-white p-3 [&_svg]:size-full"
          role="img"
          aria-label={`QR code with directions to ${place.name}`}
          // SVG markup generated by the qrcode library from our own data.
          dangerouslySetInnerHTML={{ __html: place.qrSvg }}
        />
        <p className="flex items-center gap-2 text-lg leading-snug">
          <HugeiconsIcon icon={SmartPhone01Icon} className="size-7 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
          Scan for directions
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: IconSvgElement; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="flex shrink-0 items-center pt-0.5">
        <HugeiconsIcon icon={icon} className="size-6 text-muted-foreground md:size-7" strokeWidth={2} aria-hidden />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
