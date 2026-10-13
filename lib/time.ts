/**
 * All timezone logic for the app lives here, pinned to America/New_York.
 *
 * Conventions used across the data layer:
 * - `ISODate`   "YYYY-MM-DD" — a calendar date as seen in New York.
 * - `LocalTime` "HH:mm" (24h) — a wall-clock time in New York.
 * - `Timestamp` ISO-8601 instant (e.g. from `new Date().toISOString()`).
 *
 * Never use Date#getHours/getDate/getDay etc. elsewhere: those read the
 * device's timezone (the Echo Show, the Vercel server and your laptop may
 * all disagree). Use the helpers below instead.
 */

export const TIME_ZONE = "America/New_York";

export type ISODate = string;
export type LocalTime = string;
export type Timestamp = string;

/** 0 = Sunday … 6 = Saturday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Wall-clock components of `now` in New York. */
export function zonedParts(now: Date = new Date()) {
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    partsFormatter.formatToParts(now).find((p) => p.type === type)!.value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Today's date in New York. */
export function todayISO(now: Date = new Date()): ISODate {
  const { year, month, day } = zonedParts(now);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Current wall-clock time in New York as "HH:mm". */
export function nowLocalTime(now: Date = new Date()): LocalTime {
  const { hour, minute } = zonedParts(now);
  return `${pad(hour)}:${pad(minute)}`;
}

// Calendar-date arithmetic. An ISODate has no timezone of its own, so we do
// the math on a UTC-midnight Date purely as a calendar; it never represents
// a real instant and never touches the device timezone.
function calendar(date: ISODate): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromCalendar(d: Date): ISODate {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = calendar(date);
  d.setUTCDate(d.getUTCDate() + days);
  return fromCalendar(d);
}

export function weekdayOf(date: ISODate): Weekday {
  return calendar(date).getUTCDay() as Weekday;
}

/** Inclusive range check on calendar dates. */
export function isDateInRange(date: ISODate, start: ISODate, end: ISODate): boolean {
  return date >= start && date <= end;
}

/** "07:30" → "7:30 AM" */
export function formatLocalTime(time: LocalTime): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${suffix}`;
}

const clockFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

/** "4:05 PM" — current time in New York. */
export function formatClock(now: Date = new Date()): string {
  return clockFormatter.format(now);
}

/** "7:42 PM" — wall-clock time in New York of a stored instant. */
export function formatTimestampTime(ts: Timestamp): string {
  return clockFormatter.format(new Date(ts));
}

/** "Tuesday, October 13" — current date in New York. */
export function formatLongDate(now: Date = new Date()): string {
  return longDateFormatter.format(now);
}

/** "Oct 13" for an ISODate. Formats the calendar date, not an instant. */
export function formatShortDate(date: ISODate): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", // matches calendar(); see note above
    month: "short",
    day: "numeric",
  }).format(calendar(date));
}

export function greeting(now: Date = new Date()): string {
  const { hour } = zonedParts(now);
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
