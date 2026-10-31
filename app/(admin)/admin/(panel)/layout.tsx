import { Suspense } from "react";

import { AdminNav, AdminNavView } from "@/components/admin/admin-nav";

/** Admin shell. Each page still calls requireAdmin() itself (see lib/auth/access.ts). */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <Suspense fallback={<AdminNavView pathname={null} />}>
        <AdminNav />
      </Suspense>
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
