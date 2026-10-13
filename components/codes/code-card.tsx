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
    <section className="flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted" aria-hidden>
          <HugeiconsIcon icon={Key01Icon} className="size-8" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-3xl leading-tight">{code.label}</h2>
          {code.location && (
            <p className="mt-1 flex items-start gap-2 text-xl leading-snug text-muted-foreground">
              <HugeiconsIcon icon={Location01Icon} className="mt-0.5 size-6 shrink-0" strokeWidth={2} aria-hidden />
              {code.location}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-muted px-5 py-3">
        <p
          aria-live="polite"
          data-selectable={revealed || undefined}
          className={cn(
            "min-w-0 flex-1 font-mono text-5xl leading-tight font-bold",
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
          className="w-36 rounded-2xl"
        >
          <HugeiconsIcon icon={revealed ? ViewOffIcon : ViewIcon} className="size-7" strokeWidth={2} aria-hidden />
          {revealed ? "Hide" : "Show"}
        </Button>
      </div>

      {code.notes && (
        <p className="flex items-start gap-2 text-xl leading-snug">
          <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-6 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
          {code.notes}
        </p>
      )}
    </section>
  );
}
