import { Suspense } from "react";
import { requireGuest } from "@/lib/auth/access";
import { io } from "next/cache";
import { Call02Icon, Location01Icon, Mail01Icon, SirenIcon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { PhoneLink } from "@/components/kiosk/phone-link";
import { ScreenHeader } from "@/components/kiosk/screen-header";
import { contacts, getSettings } from "@/lib/db";
import type { Contact } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ContactsPage() {
  return (
    <>
      <ScreenHeader title="Contacts" />
      <main className="px-4 pt-4 pb-6 md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain md:px-8 md:pt-0 md:pb-4">
        <Suspense fallback={<ContactsSkeleton />}>
          <ContactsContent />
        </Suspense>
      </main>
    </>
  );
}

async function ContactsContent() {
  await io();
  await requireGuest();
  const [settings, list] = await Promise.all([getSettings(), contacts.list()]);
  const emergency = list.filter((c) => c.emergency);
  const others = list.filter((c) => !c.emergency);

  return (
    <div className="flex flex-col gap-5">
      {/* Emergency numbers sit next to the street address: it's the first thing 911 asks for. */}
      <section aria-labelledby="emergency-heading" className="rounded-3xl border-2 border-destructive/40 bg-destructive/10 p-4">
        <h2 id="emergency-heading" className="mb-3 flex items-center gap-2 text-xl text-destructive md:gap-3 md:text-2xl">
          <HugeiconsIcon icon={SirenIcon} className="size-7 md:size-9" strokeWidth={2} aria-hidden />
          Emergency
        </h2>
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-3 md:gap-4">
          <div className="rounded-3xl border bg-card p-4 shadow-sm">
            <p className="flex items-center gap-2 text-base text-muted-foreground md:text-lg">
              <HugeiconsIcon icon={Location01Icon} className="size-6" strokeWidth={2} aria-hidden />
              This address
            </p>
            <p data-selectable className="mt-1 font-heading text-xl leading-snug font-bold md:text-2xl">
              {settings.address}
            </p>
          </div>
          {emergency.map((c) => (
            <ContactCard key={c.id} contact={c} emphasis />
          ))}
        </div>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="others-heading">
          <h2 id="others-heading" className="mb-3 text-xl md:text-2xl">
            Everyone else
          </h2>
          <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-3 md:gap-4">
            {others.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ContactCard({ contact, emphasis = false }: { contact: Contact; emphasis?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {!emphasis && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chart-5/15 text-chart-5 md:size-12" aria-hidden>
            <HugeiconsIcon icon={UserIcon} className="size-6 md:size-7" strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-xl leading-tight md:text-2xl">{contact.name}</h3>
          <p className="text-base leading-snug text-muted-foreground md:text-lg">{contact.role}</p>
        </div>
      </div>

      {contact.phone && (
        <p
          data-selectable
          className={cn(
            "mt-2 flex items-center gap-2 font-heading text-2xl font-bold whitespace-nowrap tabular-nums md:gap-3 md:text-3xl",
            emphasis && "text-destructive",
          )}
        >
          <HugeiconsIcon icon={Call02Icon} className="size-6 shrink-0 opacity-70 md:size-7" strokeWidth={2} aria-hidden />
          <PhoneLink phone={contact.phone} />
        </p>
      )}
      {contact.email && (
        <p data-selectable className="flex items-center gap-3 text-base break-all md:text-xl">
          <HugeiconsIcon icon={Mail01Icon} className="size-6 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
          {contact.email}
        </p>
      )}
      {contact.notes && <p className="mt-1 text-base leading-snug text-muted-foreground md:text-xl">{contact.notes}</p>}
    </div>
  );
}

function ContactsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
