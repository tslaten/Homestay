"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight01Icon,
  DashboardSquare01Icon,
  Logout03Icon,
  Settings02Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { logout } from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Home", icon: DashboardSquare01Icon },
  { href: "/admin/settings", label: "Settings", icon: Settings02Icon },
  { href: "/admin/devices", label: "Devices", icon: SmartPhone01Icon },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const linkClass = "flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md px-2.5 font-heading text-sm font-bold";

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-3xl items-center overflow-x-auto px-1 sm:gap-1 sm:px-4">
        <span className="mr-2 hidden shrink-0 font-heading font-bold sm:block">Guest Guide</span>
        {LINKS.map(({ href, label, icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(linkClass, active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}
            >
              <HugeiconsIcon icon={icon} className="size-5" strokeWidth={2} aria-hidden />
              {label}
            </Link>
          );
        })}
        <span className="flex-1" />
        <Link href="/" className={cn(linkClass, "text-muted-foreground")}>
          <span className="sr-only sm:not-sr-only">Guest view</span>
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-5" strokeWidth={2} aria-hidden />
        </Link>
        <form action={logout}>
          <button type="submit" className={cn(linkClass, "text-muted-foreground")}>
            <HugeiconsIcon icon={Logout03Icon} className="size-5" strokeWidth={2} aria-hidden />
            <span className="sr-only sm:not-sr-only">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
