/**
 * A fetch app: swarza calls `fetch` for every request, in Node.js 24. Variables from the dashboard's
 * Environment tab are in `env` and in `process.env`.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return Response.json({
        hello: env.GREETING ?? "world (set GREETING on the Environment tab)",
        try: ["/api/time", "/api/echo?name=you"],
      });
    }
    if (url.pathname === "/api/time") {
      return Response.json(
        { now: new Date().toISOString() },
        { headers: { "cache-control": "public, max-age=10" } },
      );
    }
    if (url.pathname === "/api/echo") {
      return Response.json({
        method: request.method,
        name: url.searchParams.get("name"),
        ip: request.headers.get("x-forwarded-for"),
      });
    }
    return Response.json({ error: "Not found" }, { status: 404 });
  },
};
