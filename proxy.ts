import { NextResponse, type NextRequest } from "next/server";

/**
 * First line of defence: browsers without a device cookie go to the locked
 * screen. This only checks that the cookie exists (no database), so it is an
 * early redirect, not the security boundary — requireGuest() / requireAdmin()
 * check the device against the store in every page and Server Action.
 *
 * Keep this cookie name in sync with DEVICE_COOKIE in lib/auth/device.ts
 * (that module is server-only, so it isn't imported here).
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has("hs_device")) return NextResponse.next();
  return NextResponse.redirect(new URL("/locked", request.url));
}

export const config = {
  // Everything except Next.js internals, files with an extension, and the locked screen itself.
  matcher: ["/((?!_next/|locked|.*\\..*).*)"],
};
