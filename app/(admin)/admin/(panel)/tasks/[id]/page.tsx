import { Suspense } from "react";
import { notFound } from "next/navigation";

import { deleteTask } from "../actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { TaskForm } from "@/components/admin/task-form";
import { requireAdmin } from "@/lib/auth/access";
import { pets, tasks } from "@/lib/db";

export const metadata = { title: "Edit task · Guest Guide admin" };

export default function EditTaskPage({ params }: PageProps<"/admin/tasks/[id]">) {
  return (
    <>
      <h1 className="mb-6 text-3xl">Edit task</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
        <EditTask params={params} />
      </Suspense>
    </>
  );
}

async function EditTask({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [task, petList] = await Promise.all([tasks.get(id), pets.list()]);
  if (!task) notFound();

  return (
    <div className="flex flex-col gap-10">
      {/* Keyed on the saved version, so a revisit after any change shows the stored values. */}
      <TaskForm key={`${task.id}:${task.updatedAt}`} task={task} pets={petList.map(({ id, name }) => ({ id, name }))} />
      <form action={deleteTask} className="border-t pt-6">
        <input type="hidden" name="id" value={task.id} />
        <ConfirmSubmit
          size="compact"
          variant="outline"
          message={`Delete “${task.title}”? Its ticked-off history is deleted too. To stop it for a while instead, untick “Show this task”.`}
        >
          Delete task
        </ConfirmSubmit>
      </form>
    </div>
  );
}
