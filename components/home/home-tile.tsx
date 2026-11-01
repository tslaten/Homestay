import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { cn } from "@/lib/utils";

/**
 * A large, touch-only navigation tile. Press feedback is `active:` only —
 * nothing is revealed on hover, since the Echo Show has no pointer.
 */
export function HomeTile({
  href,
  title,
  subtitle,
  icon,
  tone,
  className,
  children,
}: {
  href: string;
  title: string;
  subtitle?: string;
  icon: IconSvgElement;
  /** Tailwind classes for the icon bubble, e.g. "bg-chart-1/15 text-chart-1". */
  tone: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-touch min-w-touch flex-col gap-3 overflow-hidden rounded-3xl border bg-card p-4 text-card-foreground shadow-sm md:gap-4 md:p-6",
        "touch-manipulation transition-[transform,background-color] duration-100 active:scale-[0.98] active:bg-accent",
        "outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl md:size-16 md:rounded-2xl", tone)}>
        <HugeiconsIcon icon={icon} className="size-6 md:size-9" strokeWidth={2} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-heading text-xl font-bold tracking-tight md:text-3xl">{title}</span>
        {subtitle && <span className="line-clamp-2 text-sm text-muted-foreground md:text-xl">{subtitle}</span>}
      </span>
      {children}
    </Link>
  );
}
