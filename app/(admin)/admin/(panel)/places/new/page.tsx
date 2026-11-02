import { randomUUID } from "node:crypto";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/admin/admin-list";
import { PlaceForm } from "@/components/admin/place-form";
import { requireAdmin } from "@/lib/auth/access";

export const metadata = { title: "Add place · Guest Guide admin" };

export default function NewPlacePage() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Add place</h1>
      <Suspense fallback={<FormSkeleton />}>
        <NewPlace />
      </Suspense>
    </>
  );
}

async function NewPlace() {
  await requireAdmin();
  // Next.js keeps visited pages mounted; a fresh key per request means every visit starts with an empty form.
  return <PlaceForm key={randomUUID()} />;
}
