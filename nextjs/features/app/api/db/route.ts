import { hasDatabase } from "@/lib/db";
import { measure } from "@/lib/timing";

export const dynamic = "force-dynamic";

/** GET /api/db?n=30: database timings from inside the app, as JSON. */
export async function GET(request: Request) {
  if (!hasDatabase())
    return Response.json({ error: "No database is bound to this application." }, { status: 503 });
  const n = Math.min(500, Math.max(5, Number(new URL(request.url).searchParams.get("n")) || 30));
  const started = performance.now();
  const timings = await measure(n);
  return Response.json({ n, totalMs: Math.round(performance.now() - started), timings });
}
