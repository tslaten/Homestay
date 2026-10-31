import { randomUUID } from "node:crypto";
import { Suspense } from "react";

import { PetForm } from "@/components/admin/pet-form";
import { requireAdmin } from "@/lib/auth/access";
import { contacts } from "@/lib/db";

export const metadata = { title: "Add pet · Guest Guide admin" };

export default function NewPetPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Add pet</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
        <NewPet />
      </Suspense>
    </>
  );
}

async function NewPet() {
  await requireAdmin();
  const vets = (await contacts.list()).filter((c) => !c.emergency);
  // Next.js keeps visited pages mounted; a fresh key per request means every visit starts with an empty form.
  return <PetForm key={randomUUID()} vets={vets.map(({ id, name }) => ({ id, name }))} />;
}
