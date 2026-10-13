import { Suspense } from "react";

import { approveDevice, rejectDevice, revokeDevice } from "./actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { AutoRefresh } from "@/components/kiosk/auto-refresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPendingPairings } from "@/lib/auth/device";
import { requireAdmin } from "@/lib/auth/session";
import { devices } from "@/lib/db";
import { formatTimestamp } from "@/lib/time";

export const metadata = { title: "Devices · Guest Guide admin" };

export default function DevicesPage() {
  return (
    <>
      <h1 className="text-3xl">Devices</h1>
      <p className="mt-1 mb-6 text-muted-foreground">
        Only approved screens can open the guest guide. Open the site on the Echo Show, then approve the code it shows.
      </p>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
        <DevicesContent />
      </Suspense>
      {/* Pick up new pairing requests without reloading. */}
      <AutoRefresh intervalMs={5000} />
    </>
  );
}

async function DevicesContent() {
  await requireAdmin();
  const [pending, approved] = await Promise.all([listPendingPairings(), devices.list()]);

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="pending-heading" className="flex flex-col gap-3">
        <h2 id="pending-heading" className="text-xl">
          Waiting for approval
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-4 text-muted-foreground">
            No screens are asking right now. This list updates by itself.
          </p>
        ) : (
          pending.map((p) => (
            <div key={p.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm">
              <div>
                <p className="font-mono text-4xl font-bold tracking-widest tabular-nums">
                  {p.code.slice(0, 3)} {p.code.slice(3)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {describeBrowser(p.userAgent)} · asked {formatTimestamp(p.createdAt)} · expires{" "}
                  {formatTimestamp(p.expiresAt)}
                </p>
              </div>
              <p className="text-sm">Only approve if this matches the code on your screen.</p>
              <div className="flex flex-wrap items-end gap-3">
                <form action={approveDevice} className="flex flex-1 flex-wrap items-end gap-3">
                  <input type="hidden" name="pairingId" value={p.id} />
                  <label className="flex min-w-48 flex-1 flex-col gap-2">
                    <span className="font-heading text-sm font-bold">Name</span>
                    <Input name="name" defaultValue={guessName(p.userAgent)} maxLength={60} />
                  </label>
                  <Button type="submit" size="compact">
                    Approve
                  </Button>
                </form>
                <form action={rejectDevice}>
                  <input type="hidden" name="pairingId" value={p.id} />
                  <Button type="submit" size="compact" variant="outline">
                    Reject
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>

      <section aria-labelledby="approved-heading" className="flex flex-col gap-3">
        <h2 id="approved-heading" className="text-xl">
          Approved screens
        </h2>
        {approved.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-4 text-muted-foreground">None yet.</p>
        ) : (
          approved.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg font-bold">{d.name}</p>
                <p className="text-sm text-muted-foreground">
                  {describeBrowser(d.userAgent)} · approved {formatTimestamp(d.createdAt)} · last seen{" "}
                  {formatTimestamp(d.lastSeenAt)}
                </p>
              </div>
              <form action={revokeDevice}>
                <input type="hidden" name="deviceId" value={d.id} />
                <ConfirmSubmit
                  size="compact"
                  variant="outline"
                  message={`Remove “${d.name}”? It will show the pairing screen until you approve it again.`}
                >
                  Remove
                </ConfirmSubmit>
              </form>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function describeBrowser(ua?: string): string {
  if (!ua) return "Unknown browser";
  if (/Silk/i.test(ua)) return "Amazon Silk (Echo Show / Fire)";
  if (/iPhone|iPad/i.test(ua)) return "iPhone / iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Mac OS X/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "Browser";
}

function guessName(ua?: string): string {
  return ua && /Silk/i.test(ua) ? "Echo Show" : "Guest screen";
}
