import { randomUUID } from "node:crypto";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/admin/admin-list";
import { GuideForm } from "@/components/admin/guide-form";
import { requireAdmin } from "@/lib/auth/access";

export const metadata = { title: "Add guide · Guest Guide admin" };

export default function NewGuidePage() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Add guide</h1>
      <Suspense fallback={<FormSkeleton />}>
        <NewGuide />
      </Suspense>
    </>
  );
}

async function NewGuide() {
  await requireAdmin();
  // Next.js keeps visited pages mounted; a fresh key per request means every visit starts with an empty form.
  return <GuideForm key={randomUUID()} />;
}
