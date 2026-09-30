import { NextResponse, type NextRequest } from "next/server";

/** Runs before every page: a redirect, a request header for the page, and a response header. */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/old") return NextResponse.redirect(new URL("/ssr", request.url));
  const headers = new Headers(request.headers);
  headers.set("x-country", request.headers.get("cloudfront-viewer-country") ?? "unknown");
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("x-proxy", "1");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
