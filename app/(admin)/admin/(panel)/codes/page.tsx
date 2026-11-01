import { Suspense } from "react";

import { moveCode } from "./actions";
import { AdminList, ListHeader, ListSkeleton } from "@/components/admin/admin-list";
import { requireAdmin } from "@/lib/auth/access";
import { codes } from "@/lib/db";

export const metadata = { title: "Codes · Guest Guide admin" };

export default function CodesAdminPage() {
  return (
    <>
      <ListHeader title="Codes" addHref="/admin/codes/new" addLabel="Add code" />
      <Suspense fallback={<ListSkeleton />}>
        <CodesList />
      </Suspense>
    </>
  );
}

async function CodesList() {
  await requireAdmin();
  const rows = (await codes.list()).map((p) => ({ id: p.id, title: p.label, detail: [p.value, p.location].filter(Boolean).join(" · ") }));
  return <AdminList rows={rows} base="/admin/codes" move={moveCode} empty="No codes yet." />;
}
