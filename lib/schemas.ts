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

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

/** Task form → validated values. The schedule fields depend on `scheduleType`. */
export const taskSchema = z
  .object({
    title: text(80, "Title"),
    details: optionalText(300, "Details"),
    petId: z.string(),
    category: z.enum(["pet", "home", "plants", "trash", "other"]),
    scheduleType: z.enum(["daily", "weekly", "once"]),
    times: z.array(z.string()),
    days: z.array(z.coerce.number().int().min(0).max(6)),
    weeklyTime: z.string(),
    onceDate: z.string(),
    onceTime: z.string(),
    optional: z.boolean(),
    active: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const bad = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    const isTime = (t: string) => localTime.safeParse(t).success;
    if (v.scheduleType === "daily") {
      const times = v.times.filter(Boolean);
      if (times.length === 0) bad("times", "Add at least one time");
      else if (!times.every(isTime)) bad("times", "Use times like 08:00");
    }
    if (v.scheduleType === "weekly") {
      if (v.days.length === 0) bad("days", "Pick at least one day");
      if (!isTime(v.weeklyTime)) bad("weeklyTime", "Use a time like 19:00");
    }
    if (v.scheduleType === "once") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.onceDate)) bad("onceDate", "Pick a date");
      if (!isTime(v.onceTime)) bad("onceTime", "Use a time like 08:00");
    }
  });

export type TaskInput = z.input<typeof taskSchema>;

/** Pet form → validated values. */
export const petSchema = z.object({
  name: text(40, "Name"),
  species: z.enum(["dog", "cat", "bird", "fish", "other"]),
  breed: optionalText(60, "Breed"),
  about: optionalText(400, "About"),
  feeding: text(400, "Feeding"),
  medical: optionalText(400, "Medical"),
  hidingSpots: z
    .array(z.string().trim().max(120, "Keep each hiding spot under 120 characters"))
    .transform((spots) => spots.filter(Boolean))
    .pipe(z.array(z.string()).max(12, "Up to 12 hiding spots")),
  vetContactId: z.string(),
});
