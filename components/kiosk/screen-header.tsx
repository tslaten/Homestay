import Link from "next/link";
import { House } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Header for every non-home screen. There is no browser back button on the
 * kiosk, so this big Home button is the only way out — always render it.
 */
export function ScreenHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="flex shrink-0 items-center gap-6 px-8 pt-6 pb-4">
      <Button asChild variant="secondary" size="lg" className="rounded-2xl">
        <Link href="/" replace>
          <House className="size-8" aria-hidden />
          Home
        </Link>
      </Button>
      <h1 className="flex-1 truncate text-4xl tracking-tight">{title}</h1>
      {children}
    </header>
  );
}
