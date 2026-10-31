import { randomUUID } from "node:crypto";
import { Suspense } from "react";

import { TaskForm } from "@/components/admin/task-form";
import { requireAdmin } from "@/lib/auth/access";
import { pets } from "@/lib/db";

export const metadata = { title: "Add task · Guest Guide admin" };

export default function NewTaskPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Add task</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
        <NewTask />
      </Suspense>
    </>
  );
}

async function NewTask() {
  await requireAdmin();
  const petList = await pets.list();
  // Next.js keeps visited pages mounted; a fresh key per request means every visit starts with an empty form.
  return <TaskForm key={randomUUID()} pets={petList.map(({ id, name }) => ({ id, name }))} />;
}
