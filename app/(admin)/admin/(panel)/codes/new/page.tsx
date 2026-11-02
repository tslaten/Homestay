import { randomUUID } from "node:crypto";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/admin/admin-list";
import { CodeForm } from "@/components/admin/code-form";
import { requireAdmin } from "@/lib/auth/access";

export const metadata = { title: "Add code · Guest Guide admin" };

export default function NewCodePage() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Add code</h1>
      <Suspense fallback={<FormSkeleton />}>
        <NewCode />
      </Suspense>
    </>
  );
}

async function NewCode() {
  await requireAdmin();
  // Next.js keeps visited pages mounted; a fresh key per request means every visit starts with an empty form.
  return <CodeForm key={randomUUID()} />;
}
