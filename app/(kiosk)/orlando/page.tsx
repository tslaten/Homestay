import { Suspense } from "react";
import { requireGuest } from "@/lib/auth/access";
import { io } from "next/cache";
import QRCode from "qrcode";

import { ScreenHeader } from "@/components/kiosk/screen-header";
import { PlaceBrowser, type PlaceView } from "@/components/orlando/place-browser";
import { places } from "@/lib/db";
import { directionsUrl } from "@/lib/maps";

export default function OrlandoPage() {
  return (
    <>
      <ScreenHeader title="Orlando" />
      <main className="flex min-h-0 flex-1 flex-col px-8 pb-6">
        <Suspense fallback={<OrlandoSkeleton />}>
          <OrlandoContent />
        </Suspense>
      </main>
    </>
  );
}

async function OrlandoContent() {
  await io();
  await requireGuest();
  const list = await places.list();

  if (list.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-center text-3xl text-muted-foreground">No places added yet.</p>
      </div>
    );
  }

  // QR codes are rendered here so the Echo Show doesn't have to; always black on white for scanners.
  const views: PlaceView[] = await Promise.all(
    list.map(async (p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      address: p.address,
      driveMinutes: p.driveMinutes,
      phone: p.phone,
      url: p.url,
      favorite: p.favorite,
      qrSvg: await QRCode.toString(directionsUrl(p), {
        type: "svg",
        margin: 0,
        errorCorrectionLevel: "L", // long URL; lowest level keeps modules large (on-screen codes don't get damaged)
        color: { dark: "#000000", light: "#ffffff" },
      }),
    })),
  );

  return <PlaceBrowser places={views} />;
}

function OrlandoSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4" aria-busy>
      <div className="flex gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-14 w-36 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="flex flex-1 gap-6">
        <div className="flex w-96 flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-72 flex-1 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
