import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { incrementCounter, resetCounter } from "@/lib/db";

import { COOKIE, DAY_MS, authConfigured, signToken, verifyToken } from "./token";

const SESSION_DAYS = 30;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_SECONDS = 15 * 60;

export const cookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(maxAgeMs / 1000),
});

/** Is this request from a signed-in host? (Deduped per request.) */
export const isAdmin = cache(async (): Promise<boolean> => {
  const token = (await cookies()).get(COOKIE.admin)?.value;
  return (await verifyToken(token, "admin")) !== null;
});

/** Call at the top of every admin page and admin Server Action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

function sameSecret(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export type LoginResult = { ok: true } | { ok: false; error: string };

/** Checks the password (rate-limited per IP) and starts a session on success. */
export async function signIn(password: string): Promise<LoginResult> {
  if (!authConfigured()) {
    return { ok: false, error: "Sign-in isn’t set up yet. Add ADMIN_PASSWORD in Vercel → Settings → Environment Variables." };
  }

  const key = `login-fails:${await clientIp()}`;
  // Count this attempt up front so parallel guesses can't slip past the limit.
  const attempts = await incrementCounter(key, LOCKOUT_SECONDS);
  if (attempts > MAX_FAILED_LOGINS) {
    return { ok: false, error: "Too many attempts. Try again in 15 minutes." };
  }
  if (!sameSecret(password, process.env.ADMIN_PASSWORD!)) {
    return { ok: false, error: "That password isn’t right." };
  }

  await resetCounter(key);
  const maxAge = SESSION_DAYS * DAY_MS;
  (await cookies()).set(COOKIE.admin, await signToken({ typ: "admin", exp: Date.now() + maxAge }), cookieOptions(maxAge));
  return { ok: true };
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(COOKIE.admin);
}
