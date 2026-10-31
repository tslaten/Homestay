"use server";

import { revalidatePath } from "next/cache";

import { approvePairing, requireAdmin } from "@/lib/auth/device";
import { devices, pairings } from "@/lib/db";

export async function approveDevice(formData: FormData) {
  await requireAdmin();
  await approvePairing(String(formData.get("pairingId") ?? ""), String(formData.get("name") ?? "").slice(0, 60));
  revalidatePath("/admin", "layout");
}

export async function rejectDevice(formData: FormData) {
  await requireAdmin();
  await pairings.delete(String(formData.get("pairingId") ?? ""));
  revalidatePath("/admin", "layout");
}

/** The device is locked out on its next page load (requireGuest checks it still exists). */
export async function revokeDevice(formData: FormData) {
  await requireAdmin();
  await devices.delete(String(formData.get("deviceId") ?? ""));
  revalidatePath("/admin", "layout");
}
