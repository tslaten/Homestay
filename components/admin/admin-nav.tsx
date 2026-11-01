"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight01Icon, ArrowUpRight01Icon, DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";

/** Admin sections by URL segment; the dashboard links to every one of them. */
export const ADMIN_SECTIONS: Record<string, string> = {
  stays: "Stays",
  tasks: "Tasks",
  pets: "Pets",
  places: "Places",
  guides: "Home guide",
  contacts: "Contacts",
  codes: "Codes",
  settings: "Settings",
};

/** Reads the URL to show the current section (needs a Suspense boundary on dynamic routes). */
export function AdminNav() {
  return <AdminNavView pathname={usePathname()} />;
}

/**
 * Breadcrumb bar: Admin › Section, plus a link to the guest screens. Eight
 * sections don't fit across a phone, so the dashboard is the menu.
 * `pathname` is null while the URL isn't known yet (no section shown).
 */
export function AdminNavView({ pathname }: { pathname: string | null }) {
  const linkClass = "flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md px-2.5 font-heading text-sm font-bold";
  const segment = pathname?.split("/")[2];
  const section = segment ? ADMIN_SECTIONS[segment] : undefined;
  const onSectionList = pathname === `/admin/${segment}`;

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <nav aria-label="Admin" className="relative mx-auto flex max-w-3xl items-center px-1 sm:px-4">
        <Link
          href="/admin"
          aria-current={pathname === "/admin" ? "page" : undefined}
          className={cn(linkClass, pathname === "/admin" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}
        >
          <HugeiconsIcon icon={DashboardSquare01Icon} className="size-5" strokeWidth={2} aria-hidden />
          Admin
        </Link>
        {section && (
          <>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
            <Link
              href={`/admin/${segment}`}
              aria-current={onSectionList ? "page" : undefined}
              className={cn(linkClass, "truncate", onSectionList ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}
            >
              {section}
            </Link>
          </>
        )}
        <span className="flex-1" />
        <Link href="/" className={cn(linkClass, "text-muted-foreground")}>
          <span className="sr-only sm:not-sr-only">Guest view</span>
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-5" strokeWidth={2} aria-hidden />
        </Link>
      </nav>
    </header>
  );
}
