import { Suspense } from "react";

import { moveContact } from "./actions";
import { AdminList, ListHeader, ListSkeleton } from "@/components/admin/admin-list";
import { requireAdmin } from "@/lib/auth/access";
import { contacts } from "@/lib/db";

export const metadata = { title: "Contacts · Guest Guide admin" };

export default function ContactsAdminPage() {
  return (
    <>
      <ListHeader title="Contacts" addHref="/admin/contacts/new" addLabel="Add contact" />
      <Suspense fallback={<ListSkeleton />}>
        <ContactsList />
      </Suspense>
    </>
  );
}

async function ContactsList() {
  await requireAdmin();
  const rows = (await contacts.list()).map((p) => ({ id: p.id, title: p.name, detail: [p.emergency && "Emergency", p.role, p.phone].filter(Boolean).join(" · ") }));
  return <AdminList rows={rows} base="/admin/contacts" move={moveContact} empty="No contacts yet." />;
}
