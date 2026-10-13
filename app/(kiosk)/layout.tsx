import type { Viewport } from "next";

import { AutoRefresh } from "@/components/kiosk/auto-refresh";
import { KioskShell } from "@/components/kiosk/kiosk-shell";

// Kiosk: fill the screen exactly and block accidental pinch-zoom.
export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
};

/**
 * Full-screen kiosk shell for the Echo Show. No nav bar, tabs or breadcrumbs:
 * Home is a tile grid and every other screen renders <ScreenHeader> with a
 * Home button. Each screen owns the viewport and scrolls internally if needed.
 */
export default function KioskLayout({ children }: LayoutProps<"/">) {
  return (
    <KioskShell>
      {children}
      <AutoRefresh />
    </KioskShell>
  );
}
