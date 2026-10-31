import { AdminNav } from "@/components/admin/admin-nav";

/** Admin shell (approved devices only). Each page still calls requireAdmin() itself. */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <AdminNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
