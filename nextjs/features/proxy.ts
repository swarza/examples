import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every page: a short link from the printed badges, the visitor's country for the
 * pages, a visit counter for the live board and a response header.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/live") return NextResponse.redirect(new URL("/now", request.url));

  const headers = new Headers(request.headers);
  headers.set("x-country", request.headers.get("cloudfront-viewer-country") ?? "unknown");

  // Count page loads of the live board. Next.js strips its own prefetch headers before the proxy
  // runs, so skip fetches (prefetches and client navigations) by the browser's sec-fetch-mode.
  const mode = request.headers.get("sec-fetch-mode");
  const visit =
    pathname === "/now" && (!mode || mode === "navigate")
      ? Number(request.cookies.get("visits")?.value ?? 0) + 1
      : 0;
  if (visit) headers.set("x-visit", String(visit));

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("x-proxy", "1");
  if (visit)
    response.cookies.set("visits", String(visit), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
