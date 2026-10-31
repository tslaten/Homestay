"use server";

import { pairingStatus, type PairingStatus } from "@/lib/auth/device";

/** Polled by the locked screen. Deliberately unauthenticated: this is how a device asks in. */
export async function checkPairing(): Promise<PairingStatus> {
  return pairingStatus();
}
