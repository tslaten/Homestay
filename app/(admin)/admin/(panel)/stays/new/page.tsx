import { randomUUID } from "node:crypto";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/admin/admin-list";
import { StayForm } from "@/components/admin/stay-form";
import { requireAdmin } from "@/lib/auth/access";

export const metadata = { title: "Add stay · Guest Guide admin" };

export default function NewStayPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Add stay</h1>
      <Suspense fallback={<FormSkeleton />}>
        <NewStay />
      </Suspense>
    </>
  );
}

async function NewStay() {
  await requireAdmin();
  // Next.js keeps visited pages mounted; a fresh key per request means every visit starts with an empty form.
  return <StayForm key={randomUUID()} />;
}
