import { Suspense } from "react";
import { notFound } from "next/navigation";

import { deletePlace } from "../actions";
import { FormSkeleton } from "@/components/admin/admin-list";
import { DeleteForm } from "@/components/admin/form-parts";
import { PlaceForm } from "@/components/admin/place-form";
import { requireAdmin } from "@/lib/auth/access";
import { places } from "@/lib/db";

export const metadata = { title: "Edit place · Guest Guide admin" };

export default function EditPlacePage({ params }: PageProps<"/admin/places/[id]">) {
  return (
    <>
      <h1 className="mb-6 text-3xl">Edit place</h1>
      <Suspense fallback={<FormSkeleton />}>
        <EditPlace params={params} />
      </Suspense>
    </>
  );
}

async function EditPlace({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const place = await places.get(id);
  if (!place) notFound();

  return (
    <div className="flex flex-col gap-10">
      {/* Keyed on the saved version, so a revisit after any change shows the stored values. */}
      <PlaceForm key={`${place.id}:${place.updatedAt}`} place={place} />
      <DeleteForm action={deletePlace} id={place.id} label="Delete place" message={`Delete ${place.name}?`} />
    </div>
  );
}
