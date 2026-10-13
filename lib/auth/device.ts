import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { devices, pairings } from "@/lib/db";
import type { Device, Pairing } from "@/lib/types";

import { cookieOptions, isAdmin } from "./session";
import { COOKIE, DAY_MS, signToken, verifyToken } from "./token";

/*
 * Device lock: only approved browsers (or a signed-in host) can open the
 * guest screens.
 *
 * 1. A locked browser asks for pairing: it gets a short-lived Pairing with a
 *    6-digit code, remembered in an `hs_pair` cookie, and shows the code.
 * 2. The host approves that code in /admin/devices, which creates a Device.
 * 3. The locked browser polls; once approved it swaps `hs_pair` for an
 *    `hs_device` cookie. Revoking the Device in admin locks it again.
 */

const DEVICE_COOKIE_DAYS = 400; // browsers cap cookie lifetime at ~400 days
const PAIRING_MINUTES = 15;
const MAX_PENDING = 10;
const LAST_SEEN_RESOLUTION_MS = 60 * 60 * 1000;

/** The approved device making this request, if any. Checks revocation. */
export const currentDevice = cache(async (): Promise<Device | null> => {
  const token = await verifyToken((await cookies()).get(COOKIE.device)?.value, "device");
  if (!token) return null;
  const device = await devices.get(token.d);
  if (!device) return null; // revoked

  // Keep "last seen" roughly current without writing on every request.
  if (Date.now() - Date.parse(device.lastSeenAt) > LAST_SEEN_RESOLUTION_MS) {
    const { id, name, userAgent } = device;
    await devices.upsert({ id, name, userAgent, lastSeenAt: new Date().toISOString() });
  }
  return device;
});

/** Call in every guest screen and guest Server Action. Admins may preview. */
export async function requireGuest(): Promise<void> {
  if (await isAdmin()) return;
  if (await currentDevice()) return;
  redirect("/locked");
}

function randomCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

const isLive = (p: Pairing) => Date.parse(p.expiresAt) > Date.now();

/** Pending requests for the admin, newest first. Expired ones are cleaned up. */
export async function listPendingPairings(): Promise<Pairing[]> {
  const all = await pairings.list();
  await Promise.all(all.filter((p) => !isLive(p)).map((p) => pairings.delete(p.id)));
  return all.filter((p) => isLive(p) && !p.deviceId);
}

export type PairingStatus = { status: "paired" } | { status: "pending"; code: string; expiresAt: string };

/**
 * Called repeatedly by the locked screen. Starts a pairing request if there
 * isn't a live one, and completes it once the host has approved.
 */
export async function pairingStatus(): Promise<PairingStatus> {
  const jar = await cookies();
  if (await currentDevice()) return { status: "paired" };

  const token = await verifyToken(jar.get(COOKIE.pair)?.value, "pair");
  const existing = token ? await pairings.get(token.p) : null;

  if (existing?.deviceId) {
    const maxAge = DEVICE_COOKIE_DAYS * DAY_MS;
    jar.set(COOKIE.device, await signToken({ typ: "device", d: existing.deviceId, exp: Date.now() + maxAge }), cookieOptions(maxAge));
    jar.delete(COOKIE.pair);
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
  const pairing = await pairings.upsert({
    code,
    userAgent: (await headers()).get("user-agent")?.slice(0, 200) ?? undefined,
    expiresAt: new Date(Date.now() + ttl).toISOString(),
  });
  jar.set(COOKIE.pair, await signToken({ typ: "pair", p: pairing.id, exp: Date.now() + ttl }), cookieOptions(ttl));
  return { status: "pending", code, expiresAt: pairing.expiresAt };
}

/** Admin: approve a pending request; the locked screen picks it up on its next poll. */
export async function approvePairing(pairingId: string, name: string): Promise<boolean> {
  const pairing = await pairings.get(pairingId);
  if (!pairing || pairing.deviceId || !isLive(pairing)) return false;
  const device = await devices.upsert({
    name: name.trim() || "Echo Show",
    userAgent: pairing.userAgent,
    lastSeenAt: new Date().toISOString(),
  });
  // Give the screen a few minutes to collect its cookie even if the code was about to expire.
  await pairings.upsert({ ...pairing, deviceId: device.id, expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() });
  return true;
}
