import { Suspense } from "react";
import { requireGuest } from "@/lib/auth/access";
import { io } from "next/cache";

import { CodeCard } from "@/components/codes/code-card";
import { ScreenHeader } from "@/components/kiosk/screen-header";
import { codes } from "@/lib/db";

export default function CodesPage() {
  return (
    <>
      <ScreenHeader title="Codes" />
      <main className="px-4 pt-4 pb-6 md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain md:px-8 md:pt-0">
        <Suspense fallback={<CodesSkeleton />}>
          <CodesContent />
        </Suspense>
      </main>
    </>
  );
}

async function CodesContent() {
  await io();
  await requireGuest();
  const list = await codes.list();

  if (list.length === 0) {
    return <p className="pt-16 text-center text-2xl text-muted-foreground md:pt-24 md:text-3xl">No codes needed for this home.</p>;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 p-1 md:grid-cols-2 md:gap-5">
      {list.map(({ id, label, value, location, notes }) => (
        <CodeCard key={id} code={{ id, label, value, location, notes }} />
      ))}
    </div>
  );
}

function CodesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 p-1 md:grid-cols-2" aria-busy>
      <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      <div className="h-72 animate-pulse rounded-3xl bg-muted" />
    </div>
  );
}
