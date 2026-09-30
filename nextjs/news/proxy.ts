import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session";

/**
 * Runs before /admin pages: without a valid session cookie they redirect to the sign-in page.
 * Pages check again on the server (lib/auth.ts), since the editor may have been removed.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  // Where the edge has no variables, a cookie is enough here; the page verifies it anyway.
  if (cookie && (!secret || (await verifySession(cookie, secret)))) return NextResponse.next();
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
