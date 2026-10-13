"use server";

import { pairingStatus, type PairingStatus } from "@/lib/auth/device";
import { authConfigured } from "@/lib/auth/token";

/** Polled by the locked screen. Deliberately unauthenticated: this is how a device asks in. */
export async function checkPairing(): Promise<PairingStatus | { status: "unconfigured" }> {
  if (!authConfigured()) return { status: "unconfigured" };
  return pairingStatus();
}
