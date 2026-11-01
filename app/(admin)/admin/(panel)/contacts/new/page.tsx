import { randomUUID } from "node:crypto";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/admin/admin-list";
import { ContactForm } from "@/components/admin/contact-form";
import { requireAdmin } from "@/lib/auth/access";

export const metadata = { title: "Add contact · Guest Guide admin" };

export default function NewContactPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Add contact</h1>
      <Suspense fallback={<FormSkeleton />}>
        <NewContact />
      </Suspense>
    </>
  );
}

async function NewContact() {
  await requireAdmin();
  // Next.js keeps visited pages mounted; a fresh key per request means every visit starts with an empty form.
  return <ContactForm key={randomUUID()} />;
}
