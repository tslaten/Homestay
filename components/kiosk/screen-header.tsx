import Link from "next/link";
import { Home01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

/**
 * Header for every non-home screen. There is no browser back button on the
 * kiosk, so this big Home button is the only way out — always render it.
 * On phones it's compact and sticks to the top while the page scrolls;
 * `children` (extras like the date) only show on larger screens.
 */
export function ScreenHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur md:static md:gap-6 md:border-0 md:bg-transparent md:px-8 md:pt-6 md:pb-4 md:backdrop-blur-none">
      <Button
        asChild
        variant="secondary"
        size="lg"
        className="min-h-12 rounded-2xl px-4 text-base md:min-h-18 md:px-8 md:text-xl"
      >
        <Link href="/" replace>
          <HugeiconsIcon icon={Home01Icon} className="size-6 md:size-8" strokeWidth={2} aria-hidden />
          Home
        </Link>
      </Button>
      <h1 className="min-w-0 flex-1 truncate text-2xl tracking-tight md:text-4xl">{title}</h1>
      {children && <div className="hidden md:block">{children}</div>}
    </header>
  );
}
