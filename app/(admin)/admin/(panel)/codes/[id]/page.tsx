import { Suspense } from "react";
import { notFound } from "next/navigation";

import { deleteCode } from "../actions";
import { FormSkeleton } from "@/components/admin/admin-list";
import { DeleteForm } from "@/components/admin/form-parts";
import { CodeForm } from "@/components/admin/code-form";
import { requireAdmin } from "@/lib/auth/access";
import { codes } from "@/lib/db";

export const metadata = { title: "Edit code · Guest Guide admin" };

export default function EditCodePage({ params }: PageProps<"/admin/codes/[id]">) {
  return (
    <>
      <h1 className="mb-6 text-3xl">Edit code</h1>
      <Suspense fallback={<FormSkeleton />}>
        <EditCode params={params} />
      </Suspense>
    </>
  );
}

async function EditCode({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const code = await codes.get(id);
  if (!code) notFound();

  return (
    <div className="flex flex-col gap-10">
      {/* Keyed on the saved version, so a revisit after any change shows the stored values. */}
      <CodeForm key={`${code.id}:${code.updatedAt}`} code={code} />
      <DeleteForm action={deleteCode} id={code.id} label="Delete code" message={`Delete the ${code.label} code?`} />
    </div>
  );
}
