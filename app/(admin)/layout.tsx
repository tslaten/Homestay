/**
 * Host-facing pages, used on a phone or laptop rather than the Echo Show:
 * `data-admin` switches globals.css back to normal type and scrolling.
 */
export default function AdminRootLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-admin className="min-h-dvh bg-background">
      {children}
    </div>
  );
}
