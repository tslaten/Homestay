import { LockedScreen } from "@/components/kiosk/locked-screen";

export const metadata = { title: "Approve this screen" };

/** Where proxy.ts sends browsers that aren't approved yet. */
export default function LockedPage() {
  return <LockedScreen />;
}
