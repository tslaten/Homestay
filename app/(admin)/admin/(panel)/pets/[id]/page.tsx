import { Suspense } from "react";
import { notFound } from "next/navigation";

import { deletePet } from "../actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { PetForm } from "@/components/admin/pet-form";
import { requireAdmin } from "@/lib/auth/access";
import { contacts, pets } from "@/lib/db";

export const metadata = { title: "Edit pet · Guest Guide admin" };

export default function EditPetPage({ params }: PageProps<"/admin/pets/[id]">) {
  return (
    <>
      <h1 className="mb-6 text-3xl">Edit pet</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
        <EditPet params={params} />
      </Suspense>
    </>
  );
}

async function EditPet({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [pet, contactList] = await Promise.all([pets.get(id), contacts.list()]);
  if (!pet) notFound();
  // Any non-emergency contact can be the vet; keep the current one listed even if it's marked emergency.
  const vets = contactList.filter((c) => !c.emergency || c.id === pet.vetContactId);

  return (
    <div className="flex flex-col gap-10">
      {/* Keyed on the saved version, so a revisit after any change shows the stored values. */}
      <PetForm key={`${pet.id}:${pet.updatedAt}`} pet={pet} vets={vets.map(({ id, name }) => ({ id, name }))} />
      <form action={deletePet} className="border-t pt-6">
        <input type="hidden" name="id" value={pet.id} />
        <ConfirmSubmit
          size="compact"
          variant="outline"
          message={`Delete ${pet.name}? Their tasks stay, but are no longer linked to a pet.`}
        >
          Delete pet
        </ConfirmSubmit>
      </form>
    </div>
  );
}
