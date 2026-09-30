import { revalidatePath, revalidateTag } from "next/cache";

/**
 * "The organisers publish a change": drops the cached program and regenerates the schedule and
 * the talk pages on their next request. `curl -X POST <site>/api/revalidate`. A real site would
 * check a secret here; this demo lets anyone press the button.
 */
export function POST() {
  revalidateTag("program", "max");
  revalidatePath("/schedule");
  revalidatePath("/talks/[slug]", "page");
  return Response.json({
    revalidated: ["program", "/schedule", "/talks/[slug]"],
    at: new Date().toISOString(),
  });
}
