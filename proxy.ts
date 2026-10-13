import { NextResponse, type NextRequest } from "next/server";

import { COOKIE, verifyToken } from "@/lib/auth/token";

/**
 * First line of defence: send requests without a valid signed cookie to the
 * right door. This only checks signatures (no database), so a revoked device
 * still gets past here — the real checks are requireGuest() / requireAdmin()
 * in every page and Server Action.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const admin = await verifyToken(request.cookies.get(COOKIE.admin)?.value, "admin");

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (admin) return NextResponse.next();
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Guest screens: an approved device, or the host previewing.
  if (admin) return NextResponse.next();
  if (await verifyToken(request.cookies.get(COOKIE.device)?.value, "device")) return NextResponse.next();
  return NextResponse.redirect(new URL("/locked", request.url));
}

export const config = {
  // Everything except Next.js internals, files with an extension, and the locked screen itself.
  matcher: ["/((?!_next/|locked|.*\\..*).*)"],
};
