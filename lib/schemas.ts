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

/** Optional field list: one item per line, blanks dropped. */
const lines = (maxEach: number, maxCount: number, label: string) =>
  z
    .array(z.string().trim().max(maxEach, `Keep each ${label} under ${maxEach} characters`))
    .transform((items) => items.filter(Boolean))
    .pipe(z.array(z.string()).max(maxCount, `Up to ${maxCount} ${label}s`));

const phone = z
  .string()
  .trim()
  .max(30, "Phone must be 30 characters or fewer")
  .refine((s) => s === "" || /\d{3}/.test(s), "Enter a phone number");

/** Place form → validated values. */
export const placeSchema = z.object({
  name: text(60, "Name"),
  category: z.enum(["food", "coffee", "grocery", "pharmacy", "park", "attraction", "shopping", "medical"]),
  description: text(300, "Description"),
  address: optionalText(200, "Address"),
  driveMinutes: z
    .string()
    .trim()
    .refine((s) => s === "" || (/^\d{1,3}$/.test(s) && Number(s) <= 240), "Enter minutes, like 10")
    .transform((s) => (s === "" ? undefined : Number(s))),
  phone,
  url: optionalText(300, "Website").refine((s) => s === "" || /^https?:\/\/\S+\.\S+/.test(s), "Start with https://"),
  favorite: z.boolean(),
});

/** Contact form → validated values. */
export const contactSchema = z.object({
  name: text(80, "Name"),
  role: text(80, "Role"),
  phone,
  email: optionalText(120, "Email").refine((s) => s === "" || /^\S+@\S+\.\S+$/.test(s), "Enter an email address"),
  notes: optionalText(300, "Notes"),
  emergency: z.boolean(),
});

/** Code form → validated values. */
export const codeSchema = z.object({
  label: text(60, "Label"),
  value: text(40, "Code"),
  location: optionalText(120, "Location"),
  notes: optionalText(300, "Notes"),
});

/** Home guide (how-to) form → validated values. */
export const guideSchema = z.object({
  title: text(60, "Title"),
  category: z.enum(["pets", "appliances", "entertainment", "climate", "outdoor", "safety", "other"]),
  summary: optionalText(300, "Summary"),
  steps: lines(300, 15, "step").pipe(z.array(z.string()).min(1, "Add at least one step")),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

/** Stay form → validated values. Dates are inclusive New York calendar dates. */
export const staySchema = z
  .object({
    guestName: text(80, "Name"),
    startDate: isoDate,
    endDate: isoDate,
    notes: optionalText(300, "Notes"),
  })
  .superRefine((v, ctx) => {
    if (v.endDate < v.startDate) ctx.addIssue({ code: "custom", path: ["endDate"], message: "Ends before it starts" });
  });
