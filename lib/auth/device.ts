import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { io } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { devices, incrementCounter, pairings } from "@/lib/db";
import type { Device, Pairing } from "@/lib/types";

/*
 * Device lock. There is no password: a browser is either an approved device
 * or it isn't. Approved devices can open the guest screens *and* admin.
 *
 * 1. The very first browser to open the site is approved automatically.
 * 2. Any other browser lands on /locked, which shows a 6-digit code. Its
 *    request is a Pairing, tied to it by a random `hs_pair` cookie.
 * 3. Someone on an approved device opens /admin/devices and approves the code.
 * 4. The locked screen's next poll swaps `hs_pair` for an `hs_device` cookie.
 *    Removing the Device in admin locks that browser out again.
 *
 * Cookies hold random 256-bit tokens; the store only keeps their SHA-256
 * (which is the record id), so a copy of the database can't be used as a key.
 */

export const DEVICE_COOKIE = "hs_device";
export const PAIR_COOKIE = "hs_pair";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEVICE_COOKIE_DAYS = 400; // browsers cap cookie lifetime at ~400 days
const PAIRING_MINUTES = 15;
const MAX_PENDING = 10;
const LAST_SEEN_RESOLUTION_MS = 60 * 60 * 1000;

const newToken = () => randomBytes(32).toString("base64url");
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const cookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(maxAgeMs / 1000),
});

/** The approved device making this request, if any. Checks revocation. (Deduped per request.) */
export const currentDevice = cache(async (): Promise<Device | null> => {
  const token = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!token) return null;
  const device = await devices.get(hashToken(token));
  if (!device) return null; // never approved, or removed

  await io(); // the clock read below is per-request, not part of a prerendered shell
  // Keep "last seen" roughly current without writing on every request.
  if (Date.now() - Date.parse(device.lastSeenAt) > LAST_SEEN_RESOLUTION_MS) {
    const { id, name, userAgent } = device;
    await devices.upsert({ id, name, userAgent, lastSeenAt: new Date().toISOString() });
  }
  return device;
});

/** Call in every guest screen and guest Server Action. */
export async function requireGuest(): Promise<void> {
  if (!(await currentDevice())) redirect("/locked");
}

/** Call at the top of every admin page and admin Server Action. Same rule: approved devices only. */
export async function requireAdmin(): Promise<Device> {
  const device = await currentDevice();
  if (!device) redirect("/locked");
  return device;
}

function randomCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

const isLive = (p: Pairing) => Date.parse(p.expiresAt) > Date.now();

/** Pending requests for admin, newest first. Expired ones are cleaned up. */
export async function listPendingPairings(): Promise<Pairing[]> {
  const all = await pairings.list();
  await Promise.all(all.filter((p) => !isLive(p)).map((p) => pairings.delete(p.id)));
  return all.filter((p) => isLive(p) && !p.approvedAs);
}

export function guessDeviceName(userAgent?: string): string {
  if (!userAgent) return "Screen";
  if (/Silk/i.test(userAgent)) return "Echo Show";
  if (/iPhone/i.test(userAgent)) return "iPhone";
  if (/iPad/i.test(userAgent)) return "iPad";
  if (/Android/i.test(userAgent)) return "Android";
  return "Computer";
}

/** Issue a device cookie for a new Device record. */
async function becomeDevice(name: string, userAgent: string | undefined): Promise<void> {
  const token = newToken();
  await devices.upsert({ id: hashToken(token), name, userAgent, lastSeenAt: new Date().toISOString() });
  const maxAge = DEVICE_COOKIE_DAYS * DAY_MS;
  (await cookies()).set(DEVICE_COOKIE, token, cookieOptions(maxAge));
}

export type PairingStatus = { status: "paired" } | { status: "pending"; code: string; expiresAt: string };

/**
 * Polled by the locked screen. Approves the very first device automatically,
 * otherwise starts (or continues) a pairing request and completes it once
 * someone has approved the code in admin.
 */
export async function pairingStatus(): Promise<PairingStatus> {
  const jar = await cookies();
  if (await currentDevice()) return { status: "paired" };

  const userAgent = (await headers()).get("user-agent")?.slice(0, 200) ?? undefined;

  // First run: nobody is approved yet, so this browser becomes the first device.
  // The short-lived counter stops two simultaneous first visitors both getting in.
  if ((await devices.list()).length === 0 && (await incrementCounter("first-device-claim", 30)) === 1) {
    await becomeDevice(guessDeviceName(userAgent), userAgent);
    jar.delete(PAIR_COOKIE);
    return { status: "paired" };
  }

  const pairToken = jar.get(PAIR_COOKIE)?.value;
  const existing = pairToken ? await pairings.get(hashToken(pairToken)) : null;

  if (existing?.approvedAs && isLive(existing)) {
    await becomeDevice(existing.approvedAs, existing.userAgent);
    jar.delete(PAIR_COOKIE);
    await pairings.delete(existing.id);
    return { status: "paired" };
  }
  if (existing && isLive(existing)) {
    return { status: "pending", code: existing.code, expiresAt: existing.expiresAt };
  }

  // Start a new request. Cap how many can be pending so nobody can flood the list.
  const pending = await listPendingPairings();
  await Promise.all(pending.slice(MAX_PENDING - 1).map((p) => pairings.delete(p.id)));

  const used = new Set(pending.map((p) => p.code));
  let code = randomCode();
  while (used.has(code)) code = randomCode();

  const ttl = PAIRING_MINUTES * 60 * 1000;
  const token = newToken();
  const pairing = await pairings.upsert({
    id: hashToken(token),
    code,
    userAgent,
    expiresAt: new Date(Date.now() + ttl).toISOString(),
  });
  jar.set(PAIR_COOKIE, token, cookieOptions(ttl));
  return { status: "pending", code, expiresAt: pairing.expiresAt };
}

/** Admin: approve a pending request; the locked screen collects its cookie on its next poll. */
export async function approvePairing(pairingId: string, name: string): Promise<boolean> {
  const pairing = await pairings.get(pairingId);
  if (!pairing || pairing.approvedAs || !isLive(pairing)) return false;
  // Give the screen a few minutes to collect its cookie even if the code was about to expire.
  await pairings.upsert({
    ...pairing,
    approvedAs: name.trim() || guessDeviceName(pairing.userAgent),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
  return true;
}
