/**
 * Marks its subtree as kiosk UI. On the Echo Show (md and up) each screen owns
 * the viewport and scrolls inside; on phones the page simply scrolls. globals.css keys the large type, no text
 * selection and no overscroll off `data-kiosk`, so admin pages don't get them.
 */
export function KioskShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-kiosk className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden">
      {children}
    </div>
  );
}
