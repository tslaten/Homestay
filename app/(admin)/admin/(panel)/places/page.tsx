import { Suspense } from "react";

import { movePlace } from "./actions";
import { AdminList, ListHeader, ListSkeleton } from "@/components/admin/admin-list";
import { PLACE_CATEGORIES } from "@/components/admin/place-form";
import { requireAdmin } from "@/lib/auth/access";
import { places } from "@/lib/db";

export const metadata = { title: "Places · Guest Guide admin" };

export default function PlacesAdminPage() {
  return (
    <>
      <ListHeader title="Places" addHref="/admin/places/new" addLabel="Add place" />
      <Suspense fallback={<ListSkeleton />}>
        <PlacesList />
      </Suspense>
    </>
  );
}

async function PlacesList() {
  await requireAdmin();
  const rows = (await places.list()).map((p) => ({ id: p.id, title: p.name, detail: [PLACE_CATEGORIES[p.category], p.favorite && "Host’s pick", p.description].filter(Boolean).join(" · ") }));
  return <AdminList rows={rows} base="/admin/places" move={movePlace} empty="No places yet." />;
}
