"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { checkPairing } from "@/app/(kiosk)/locked/actions";

type State = Awaited<ReturnType<typeof checkPairing>> | { status: "loading" } | { status: "error" };

const POLL_MS = 3000;

export function LockedScreen() {
  const [state, setState] = useState<State>({ status: "loading" });
  // The site's own address, for the instructions (empty during server render).
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "",
  );

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const next = await checkPairing();
        if (stopped) return;
        if (next.status === "paired") {
          // Full reload so the new cookie is sent through proxy.ts.
          window.location.replace("/");
          return;
        }
        setState(next);
      } catch {
        if (!stopped) setState({ status: "error" });
      }
      timer = setTimeout(poll, POLL_MS);
    };
    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-10 text-center">
      <span className="flex size-24 items-center justify-center rounded-3xl bg-muted" aria-hidden>
        <HugeiconsIcon icon={SquareLock02Icon} className="size-14" strokeWidth={2} />
      </span>

      <h1 className="text-5xl">Approve this screen</h1>
          <div className="rounded-3xl border bg-card px-12 py-6 shadow-sm">
            <p className="text-xl text-muted-foreground">Pairing code</p>
            <p className="font-mono text-8xl font-bold tracking-widest tabular-nums" aria-live="polite">
              {state.status === "pending" ? `${state.code.slice(0, 3)} ${state.code.slice(3)}` : "··· ···"}
            </p>
          </div>
      <p className="max-w-3xl text-2xl leading-snug text-muted-foreground">
        On a screen that’s already approved, open{" "}
        <span className="font-bold text-foreground">{host || "this site"}/admin/devices</span> and approve this code.
        This screen opens by itself once it’s approved.
      </p>
      {state.status === "error" && <p className="text-xl text-destructive">Can’t reach the server — retrying…</p>}
    </main>
  );
}
