"use server";

import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth/session";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const result = await signIn(String(formData.get("password") ?? ""));
  if (!result.ok) return { error: result.error };

  // Only ever return to an admin page on this site.
  const next = String(formData.get("next") ?? "");
  redirect(/^\/admin(\/|$|\?)/.test(next) ? next : "/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin/login");
}
