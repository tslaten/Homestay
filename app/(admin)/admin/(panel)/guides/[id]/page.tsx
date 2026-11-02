import { Suspense } from "react";
import { notFound } from "next/navigation";

import { deleteGuide } from "../actions";
import { FormSkeleton } from "@/components/admin/admin-list";
import { DeleteForm } from "@/components/admin/form-parts";
import { GuideForm } from "@/components/admin/guide-form";
import { requireAdmin } from "@/lib/auth/access";
import { howtos } from "@/lib/db";

export const metadata = { title: "Edit guide · Guest Guide admin" };

export default function EditGuidePage({ params }: PageProps<"/admin/guides/[id]">) {
  return (
    <>
      <h1 className="mb-6 text-3xl">Edit guide</h1>
      <Suspense fallback={<FormSkeleton />}>
        <EditGuide params={params} />
      </Suspense>
    </>
  );
}

async function EditGuide({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const guide = await howtos.get(id);
  if (!guide) notFound();

  return (
    <div className="flex flex-col gap-10">
      {/* Keyed on the saved version, so a revisit after any change shows the stored values. */}
      <GuideForm key={`${guide.id}:${guide.updatedAt}`} guide={guide} />
      <DeleteForm action={deleteGuide} id={guide.id} label="Delete guide" message={`Delete the “${guide.title}” guide?`} />
    </div>
  );
}
