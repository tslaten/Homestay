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
      <main className="flex min-h-0 flex-1 flex-col px-8 pb-6">
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
        <p className="text-center text-3xl text-muted-foreground">No guides yet.</p>
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
    <div className="flex flex-1 gap-6" aria-busy>
      <div className="flex w-80 flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <div className="h-24 w-96 animate-pulse rounded-3xl bg-muted" />
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        <div className="h-24 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
