import { Suspense } from "react";

import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Settings · Guest Guide admin" };

export default function SettingsPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl">Settings</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
        <SettingsContent />
      </Suspense>
    </>
  );
}

async function SettingsContent() {
  await requireAdmin();
  return <SettingsForm settings={await getSettings()} />;
}
