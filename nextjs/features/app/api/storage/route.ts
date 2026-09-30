import { hasStorage } from "@/lib/storage";
import { measureStorage } from "@/lib/storage-timing";

export const dynamic = "force-dynamic";

/** GET /api/storage?n=10: bucket operations from inside the app, timed (p50, p90, max in ms). */
export async function GET(request: Request) {
  if (!hasStorage())
    return Response.json({ error: "No bucket is bound to this application." }, { status: 503 });
  const n = Math.min(100, Math.max(3, Number(new URL(request.url).searchParams.get("n")) || 10));
  const timings = await measureStorage(n);
  return Response.json({
    n,
    endpoint: process.env.STORAGE_ENDPOINT,
    timings: Object.fromEntries(timings.map(({ name, ...t }) => [name, t])),
  });
}
