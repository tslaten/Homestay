import { ScreenHeader } from "@/components/kiosk/screen-header";

export default function NotFound() {
  return (
    <>
      <ScreenHeader title="Coming soon" />
      <main className="flex flex-1 items-center justify-center px-8">
        <p className="text-center text-3xl text-muted-foreground">This screen isn’t set up yet.</p>
      </main>
    </>
  );
}
