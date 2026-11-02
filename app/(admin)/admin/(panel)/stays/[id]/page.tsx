import { Suspense } from "react";
import { notFound } from "next/navigation";

import { deleteStay } from "../actions";
import { FormSkeleton } from "@/components/admin/admin-list";
import { DeleteForm } from "@/components/admin/form-parts";
import { StayForm } from "@/components/admin/stay-form";
import { requireAdmin } from "@/lib/auth/access";
import { stays } from "@/lib/db";

export const metadata = { title: "Edit stay · Guest Guide admin" };

export default function EditStayPage({ params }: PageProps<"/admin/stays/[id]">) {
  return (
    <>
      <h1 className="mb-6 text-3xl">Edit stay</h1>
      <Suspense fallback={<FormSkeleton />}>
        <EditStay params={params} />
      </Suspense>
    </>
  );
}

async function EditStay({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const stay = await stays.get(id);
  if (!stay) notFound();

  return (
    <div className="flex flex-col gap-10">
      {/* Keyed on the saved version, so a revisit after any change shows the stored values. */}
      <StayForm key={`${stay.id}:${stay.updatedAt}`} stay={stay} />
      <DeleteForm action={deleteStay} id={stay.id} label="Delete stay" message={`Delete ${stay.guestName}’s stay?`} />
    </div>
  );
}
