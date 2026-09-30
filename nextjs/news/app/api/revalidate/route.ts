import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Called by the scheduled jobs after they publish or re-rank stories, with REVALIDATE_SECRET as a
 * bearer token. Refreshes every cached page that reads stories.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? "";
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const ok =
    secret.length >= 16 &&
    given.length === secret.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag("posts", "max");
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
