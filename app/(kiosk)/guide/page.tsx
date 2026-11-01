import { Suspense } from "react";
import { requireGuest } from "@/lib/auth/access";
import { io } from "next/cache";

import { GuideBrowser } from "@/components/guide/guide-browser";
import { ScreenHeader } from "@/components/kiosk/screen-header";
import { howtos } from "@/lib/db";

export default function GuidePage() {
  return (
    <>
      <ScreenHeader title="Home Guide" />
      <main className="flex flex-col px-4 pt-4 pb-6 md:min-h-0 md:flex-1 md:px-8 md:pt-0">
        <Suspense fallback={<GuideSkeleton />}>
          <GuideContent />
        </Suspense>
      </main>
    </>
  );
}

async function GuideContent() {
  await io();
  await requireGuest();
  const list = await howtos.list();

  if (list.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="py-16 text-center text-2xl text-muted-foreground md:py-0 md:text-3xl">No guides yet.</p>
      </div>
    );
  }

  return (
    <GuideBrowser
      guides={list.map(({ id, title, category, summary, steps }) => ({ id, title, category, summary, steps }))}
    />
  );
}

function GuideSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:flex-row md:gap-6" aria-busy>
      <div className="flex flex-wrap gap-2 md:w-80 md:flex-col">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-12 w-32 animate-pulse rounded-2xl bg-muted md:h-16 md:w-auto" />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <div className="h-24 animate-pulse rounded-3xl bg-muted md:w-96" />
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
