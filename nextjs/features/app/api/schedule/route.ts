import { getSchedule } from "@/lib/schedule";
import { event } from "@/lib/program";

/** GET /api/schedule (also at /schedule.json, a rewrite in next.config.mjs): the program as JSON. */
export async function GET() {
  const { publishedAt, program } = await getSchedule();
  return Response.json({
    event,
    publishedAt: new Date(publishedAt).toISOString(),
    program: program.map(({ slug, start, end, kind, title, speaker }) => ({
      slug,
      start,
      end,
      kind,
      title,
      speaker: speaker?.name,
    })),
  });
}
