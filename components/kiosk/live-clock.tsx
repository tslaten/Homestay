"use client";

import { useEffect, useState } from "react";

import { formatClock, formatLongDate } from "@/lib/time";

/**
 * Ticking New York clock. The server renders the first value (so there is no
 * hydration mismatch and no Date read during prerender); the client takes over.
 */
export function LiveClock({ initialTime, initialDate }: { initialTime: string; initialDate: string }) {
  const [time, setTime] = useState(initialTime);
  const [date, setDate] = useState(initialDate);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(formatClock(now));
      setDate(formatLongDate(now));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="shrink-0 text-right">
      <div className="font-heading text-3xl font-bold tabular-nums leading-none tracking-tight whitespace-nowrap md:text-6xl">{time}</div>
      <div className="mt-1 text-sm text-muted-foreground md:mt-2 md:text-xl">{date}</div>
    </div>
  );
}
