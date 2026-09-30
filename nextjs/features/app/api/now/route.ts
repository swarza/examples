import { slotAt, venueClock } from "@/lib/program";

/** GET /api/now on the edge runtime: what is on stage right now, on the venue's clock. */
export const runtime = "edge";

export function GET() {
  const at = new Date();
  const { now, next } = slotAt(at);
  const brief = (s?: { slug: string; start: string; title: string; speaker?: { name: string } }) =>
    s ? { slug: s.slug, start: s.start, title: s.title, speaker: s.speaker?.name } : null;
  return Response.json({
    runtime: "edge",
    at: at.toISOString(),
    venueTime: venueClock(at),
    now: brief(now),
    next: brief(next),
  });
}
