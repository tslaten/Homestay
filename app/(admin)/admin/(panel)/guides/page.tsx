import { Suspense } from "react";

import { moveGuide } from "./actions";
import { AdminList, ListHeader, ListSkeleton } from "@/components/admin/admin-list";
import { GUIDE_CATEGORIES } from "@/components/admin/guide-form";
import { requireAdmin } from "@/lib/auth/access";
import { howtos } from "@/lib/db";

export const metadata = { title: "Home guide · Guest Guide admin" };

export default function HomeguideAdminPage() {
  return (
    <>
      <ListHeader title="Home guide" addHref="/admin/guides/new" addLabel="Add guide" />
      <Suspense fallback={<ListSkeleton />}>
        <HomeguideList />
      </Suspense>
    </>
  );
}

async function HomeguideList() {
  await requireAdmin();
  const rows = (await howtos.list()).map((p) => ({ id: p.id, title: p.title, detail: `${GUIDE_CATEGORIES[p.category]} · ${p.steps.length === 1 ? "1 step" : `${p.steps.length} steps`}` }));
  return <AdminList rows={rows} base="/admin/guides" move={moveGuide} empty="No guides yet." />;
}
