import { z } from "zod";

/** "HH:MM", 24-hour, New York wall-clock time (see lib/time.ts). */
export const localTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 16:00");

const text = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be ${max} characters or fewer`);

/** Settings form → validated values. Field names match the form inputs. */
export const settingsSchema = z
  .object({
    propertyName: text(80, "Property name"),
    address: text(200, "Address"),
    hostName: text(80, "Host name"),
    welcomeMessage: z.string().trim().max(300, "Keep the welcome message under 300 characters"),
    checkInTime: localTime,
    checkOutTime: localTime,
    wifiSsid: text(32, "Network name"),
    wifiPassword: z.string().max(63, "Wi-Fi passwords are at most 63 characters"),
    wifiSecurity: z.enum(["WPA", "WEP", "nopass"]),
    wifiHidden: z.boolean(),
    houseRules: z
      .array(z.string().trim().max(200, "Keep each rule under 200 characters"))
      .transform((rules) => rules.filter(Boolean))
      .pipe(z.array(z.string()).max(20, "Up to 20 rules")),
  })
  .superRefine((v, ctx) => {
    if (v.wifiSecurity === "WPA" && v.wifiPassword.length < 8) {
      ctx.addIssue({ code: "custom", path: ["wifiPassword"], message: "WPA passwords are at least 8 characters" });
    }
  });

export type SettingsInput = z.input<typeof settingsSchema>;

/** First error message per field, for showing under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
