import Link from "next/link";
import { Edit02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { Button } from "@/components/ui/button";

export interface AdminRow {
  id: string;
  title: string;
  detail?: string;
}

/** Page title with an "Add …" button, shared by every list page. */
export function ListHeader({ title, addHref, addLabel }: { title: string; addHref: string; addLabel: string }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h1 className="text-3xl">{title}</h1>
      <Button asChild size="compact">
        <Link href={addHref}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} aria-hidden />
          {addLabel}
        </Link>
      </Button>
    </div>
  );
}

/** Rows linking to `${base}/${id}`, with ↑/↓ when the list has a manual order. */
export function AdminList({
  rows,
  base,
  move,
  empty,
}: {
  rows: AdminRow[];
  base: string;
  move?: (formData: FormData) => Promise<void>;
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="rounded-2xl border border-dashed p-4 text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r, i) => (
        <li key={r.id} className="flex items-center gap-2 rounded-2xl border bg-card p-3 shadow-sm">
          <Link href={`${base}/${r.id}`} className="min-w-0 flex-1 rounded-md p-1 active:bg-accent">
            <span className="block truncate font-heading font-bold">{r.title}</span>
            {r.detail && <span className="block truncate text-sm text-muted-foreground">{r.detail}</span>}
          </Link>
          {move && <ReorderButtons id={r.id} label={r.title} action={move} first={i === 0} last={i === rows.length - 1} />}
          <Button asChild size="compact" variant="outline" aria-label={`Edit ${r.title}`}>
            <Link href={`${base}/${r.id}`}>
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} aria-hidden />
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function ListSkeleton() {
  return <div className="h-48 animate-pulse rounded-2xl bg-muted" />;
}

export function FormSkeleton() {
  return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;
}
