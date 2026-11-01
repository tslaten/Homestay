"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { InformationCircleIcon, Key01Icon, Location01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import type { Code } from "@/lib/types";
import { cn } from "@/lib/utils";

/** How long a revealed code stays on screen before hiding itself. */
const AUTO_HIDE_MS = 30_000;

export type CodeView = Pick<Code, "id" | "label" | "value" | "location" | "notes">;

/**
 * A door/gate code that is hidden until tapped. This is a privacy screen for
 * people glancing at the display, not access control: the value is in the page.
 */
export function CodeCard({ code }: { code: CodeView }) {
  const [revealed, setRevealed] = useState(false);

  // Hide again after a while so a code isn't left showing on the counter.
  useEffect(() => {
    if (!revealed) return;
    const id = setTimeout(() => setRevealed(false), AUTO_HIDE_MS);
    return () => clearTimeout(id);
  }, [revealed]);

  // Next.js keeps visited screens mounted (hidden) for back-navigation; hide
  // the code when the guest leaves this screen so it's never shown on return.
  useLayoutEffect(() => () => setRevealed(false), []);

  return (
    <section className="flex flex-col gap-3 rounded-3xl border bg-card p-4 shadow-sm md:gap-4 md:p-5">
      <div className="flex items-start gap-3 md:gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted md:size-14 md:rounded-2xl" aria-hidden>
          <HugeiconsIcon icon={Key01Icon} className="size-6 md:size-8" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-2xl leading-tight md:text-3xl">{code.label}</h2>
          {code.location && (
            <p className="mt-1 flex items-start gap-2 text-base leading-snug text-muted-foreground md:text-xl">
              <HugeiconsIcon icon={Location01Icon} className="mt-0.5 size-5 shrink-0 md:size-6" strokeWidth={2} aria-hidden />
              {code.location}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-2 md:gap-4 md:px-5 md:py-3">
        <p
          aria-live="polite"
          data-selectable={revealed || undefined}
          className={cn(
            "min-w-0 flex-1 font-mono text-4xl leading-tight font-bold md:text-5xl",
            revealed ? "break-all" : "whitespace-nowrap text-muted-foreground",
          )}
        >
          {/* Fixed-length mask so the hidden state doesn't reveal the code's length. */}
          {revealed ? code.value : "••••••"}
          {!revealed && <span className="sr-only">Code hidden</span>}
        </p>
        <Button
          type="button"
          size="lg"
          variant={revealed ? "secondary" : "default"}
          aria-pressed={revealed}
          onClick={() => setRevealed((r) => !r)}
          className="min-h-12 shrink-0 rounded-2xl px-4 text-base md:min-h-18 md:w-36 md:text-xl"
        >
          <HugeiconsIcon icon={revealed ? ViewOffIcon : ViewIcon} className="size-6 md:size-7" strokeWidth={2} aria-hidden />
          {revealed ? "Hide" : "Show"}
        </Button>
      </div>

      {code.notes && (
        <p className="flex items-start gap-2 text-base leading-snug md:text-xl">
          <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-5 shrink-0 text-muted-foreground md:size-6" strokeWidth={2} aria-hidden />
          {code.notes}
        </p>
      )}
    </section>
  );
}
