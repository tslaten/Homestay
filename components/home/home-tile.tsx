import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A large, touch-only navigation tile. Press feedback is `active:` only —
 * nothing is revealed on hover, since the Echo Show has no pointer.
 */
export function HomeTile({
  href,
  title,
  subtitle,
  icon: Icon,
  tone,
  className,
  children,
}: {
  href: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon bubble, e.g. "bg-chart-1/15 text-chart-1". */
  tone: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-touch min-w-touch flex-col gap-4 overflow-hidden rounded-3xl border bg-card p-6 text-card-foreground shadow-sm",
        "touch-manipulation transition-[transform,background-color] duration-100 active:scale-[0.98] active:bg-accent",
        "outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-2xl", tone)}>
        <Icon className="size-9" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-3xl font-semibold tracking-tight">{title}</span>
        {subtitle && <span className="line-clamp-2 text-xl text-muted-foreground">{subtitle}</span>}
      </span>
      {children}
    </Link>
  );
}
