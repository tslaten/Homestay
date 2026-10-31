import "server-only";

import { connection } from "next/server";

/*
 * Access control hooks.
 *
 * Right now access is OPEN: anyone with the site's URL can use the guest
 * screens and /admin (the owner's choice, to be revisited). These hooks are
 * still called at every entry point — each guest page's data component and
 * guest Server Action calls requireGuest(), each admin page and admin Server
 * Action calls requireAdmin() — so adding real checks later means changing
 * only this file.
 */

/** Guest screens and guest Server Actions. Currently allows everyone. */
export async function requireGuest(): Promise<void> {}

/**
 * Admin pages and admin Server Actions. Currently allows everyone, but still
 * waits for the real request: admin must always show live data, never a
 * copy prerendered at build time.
 */
export async function requireAdmin(): Promise<void> {
  await connection();
}
