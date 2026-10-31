"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/access";
import { updateSettings } from "@/lib/db";
import { fieldErrors, settingsSchema } from "@/lib/schemas";

export type SettingsFormState = {
  ok?: boolean;
  errors?: Record<string, string>;
  /** What was submitted, so the form keeps the guest's input after an error. */
  values?: Record<string, string>;
};

export async function saveSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();

  const raw = {
    propertyName: String(formData.get("propertyName") ?? ""),
    address: String(formData.get("address") ?? ""),
    hostName: String(formData.get("hostName") ?? ""),
    welcomeMessage: String(formData.get("welcomeMessage") ?? ""),
    checkInTime: String(formData.get("checkInTime") ?? ""),
    checkOutTime: String(formData.get("checkOutTime") ?? ""),
    wifiSsid: String(formData.get("wifiSsid") ?? ""),
    wifiPassword: String(formData.get("wifiPassword") ?? ""),
    wifiSecurity: String(formData.get("wifiSecurity") ?? ""),
    wifiHidden: formData.get("wifiHidden") === "on",
    houseRules: String(formData.get("houseRules") ?? "").split("\n"),
  };
  const values = { ...raw, wifiHidden: raw.wifiHidden ? "on" : "", houseRules: raw.houseRules.join("\n") };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const v = parsed.data;
  await updateSettings({
    propertyName: v.propertyName,
    address: v.address,
    hostName: v.hostName,
    welcomeMessage: v.welcomeMessage,
    checkInTime: v.checkInTime,
    checkOutTime: v.checkOutTime,
    wifi: {
      ssid: v.wifiSsid,
      password: v.wifiSecurity === "nopass" ? "" : v.wifiPassword,
      security: v.wifiSecurity,
      hidden: v.wifiHidden,
    },
    houseRules: v.houseRules,
  });

  // Guest screens show the change on their next load.
  revalidatePath("/", "layout");
  return { ok: true, values };
}
