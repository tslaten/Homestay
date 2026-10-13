import { Suspense } from "react";

import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in · Guest Guide" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl">Guest Guide admin</h1>
        <p className="mt-1 mb-6 text-muted-foreground">Sign in to edit the guide and approve screens.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
