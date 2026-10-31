"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight01Icon,
  DashboardSquare01Icon,
  PawPrintIcon,
  Settings02Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Home", icon: DashboardSquare01Icon },
  { href: "/admin/tasks", label: "Tasks", icon: Task01Icon },
  { href: "/admin/pets", label: "Pets", icon: PawPrintIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings02Icon },
] as const;

/** Reads the URL to highlight the current section (needs a Suspense boundary on dynamic routes). */
export function AdminNav() {
  return <AdminNavView pathname={usePathname()} />;
}

/** The nav itself; `pathname` is null while the URL isn't known yet (no link highlighted). */
export function AdminNavView({ pathname }: { pathname: string | null }) {
  const linkClass = "flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md px-2.5 font-heading text-sm font-bold";

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-3xl items-center overflow-x-auto px-1 sm:gap-1 sm:px-4">
        <span className="mr-2 hidden shrink-0 font-heading font-bold sm:block">Guest Guide</span>
        {LINKS.map(({ href, label, icon }) => {
          const active = pathname !== null && (href === "/admin" ? pathname === href : pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(linkClass, active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}
            >
              <HugeiconsIcon icon={icon} className="size-5" strokeWidth={2} aria-hidden />
              {/* "Home" is icon-only on phones so the whole nav fits without scrolling. */}
              <span className={href === "/admin" ? "sr-only sm:not-sr-only" : undefined}>{label}</span>
            </Link>
          );
        })}
        <span className="flex-1" />
        <Link href="/" className={cn(linkClass, "text-muted-foreground")}>
          <span className="sr-only sm:not-sr-only">Guest view</span>
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-5" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
