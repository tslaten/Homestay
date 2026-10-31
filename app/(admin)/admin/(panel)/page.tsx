import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { requireAdmin } from "@/lib/auth/access";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Guest Guide admin" };

export default function AdminHome() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Admin</h1>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted" />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

async function DashboardContent() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-3">
      <Tile
        href="/admin/settings"
        icon={Settings02Icon}
        title="Settings"
        detail={`${settings.propertyName} · Wi-Fi “${settings.wifi.ssid}”`}
      />
      <p className="mt-4 text-sm text-muted-foreground">
        Editing pets, tasks, stays, guides, places, contacts and codes is coming next.
      </p>
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
