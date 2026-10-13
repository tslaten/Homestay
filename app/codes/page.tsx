import { Suspense } from "react";
import { io } from "next/cache";

import { CodeCard } from "@/components/codes/code-card";
import { ScreenHeader } from "@/components/kiosk/screen-header";
import { codes } from "@/lib/db";

export default function CodesPage() {
  return (
    <>
      <ScreenHeader title="Codes" />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-6">
        <Suspense fallback={<CodesSkeleton />}>
          <CodesContent />
        </Suspense>
      </main>
    </>
  );
}

async function CodesContent() {
  await io();
  const list = await codes.list();

  if (list.length === 0) {
    return <p className="pt-24 text-center text-3xl text-muted-foreground">No codes needed for this home.</p>;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 p-1 md:grid-cols-2">
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
