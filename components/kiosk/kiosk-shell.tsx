/**
 * Marks its subtree as kiosk UI. globals.css keys the large type, no text
 * selection and no overscroll off `data-kiosk`, so admin pages don't get them.
 */
export function KioskShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-kiosk className="flex h-dvh flex-col overflow-hidden">
      {children}
    </div>
  );
}
