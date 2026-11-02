import { Suspense } from "react";

import { AdminList, ListHeader, ListSkeleton } from "@/components/admin/admin-list";
import { requireAdmin } from "@/lib/auth/access";
import { stays } from "@/lib/db";
import { formatDateRange } from "@/lib/time";

export const metadata = { title: "Stays · Guest Guide admin" };

export default function StaysAdminPage() {
  return (
    <>
      <ListHeader title="Stays" addHref="/admin/stays/new" addLabel="Add stay" />
      <Suspense fallback={<ListSkeleton />}>
        <StaysList />
      </Suspense>
    </>
  );
}

async function StaysList() {
  await requireAdmin();
  // Sorted by start date, newest last.
  const rows = (await stays.list()).map((p) => ({ id: p.id, title: p.guestName, detail: formatDateRange(p.startDate, p.endDate) }));
  return <AdminList rows={rows} base="/admin/stays" empty="No stays yet. Add one so the guest screens greet your guest by name." />;
}
