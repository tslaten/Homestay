import { KioskShell } from "@/components/kiosk/kiosk-shell";
import { ScreenHeader } from "@/components/kiosk/screen-header";

// Renders under the shared root layout, so it opts into the kiosk look itself.
export default function NotFound() {
  return (
    <KioskShell>
      <ScreenHeader title="Not found" />
      <main className="flex flex-1 items-center justify-center px-8">
        <p className="text-center text-3xl text-muted-foreground">This screen doesn’t exist.</p>
      </main>
    </KioskShell>
  );
}
