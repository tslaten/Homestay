import { Suspense } from "react";
import { notFound } from "next/navigation";

import { deleteContact } from "../actions";
import { FormSkeleton } from "@/components/admin/admin-list";
import { DeleteForm } from "@/components/admin/form-parts";
import { ContactForm } from "@/components/admin/contact-form";
import { requireAdmin } from "@/lib/auth/access";
import { contacts } from "@/lib/db";

export const metadata = { title: "Edit contact · Guest Guide admin" };

export default function EditContactPage({ params }: PageProps<"/admin/contacts/[id]">) {
  return (
    <>
      <h1 className="mb-6 text-3xl">Edit contact</h1>
      <Suspense fallback={<FormSkeleton />}>
        <EditContact params={params} />
      </Suspense>
    </>
  );
}

async function EditContact({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const contact = await contacts.get(id);
  if (!contact) notFound();

  return (
    <div className="flex flex-col gap-10">
      {/* Keyed on the saved version, so a revisit after any change shows the stored values. */}
      <ContactForm key={`${contact.id}:${contact.updatedAt}`} contact={contact} />
      <DeleteForm action={deleteContact} id={contact.id} label="Delete contact" message={`Delete ${contact.name}? Any pet using them as their vet will have no vet set.`} />
    </div>
  );
}
