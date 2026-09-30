import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { postViews, posts } from "@/lib/schema";

/** One read of a published story (the beacon in ViewBeacon.tsx). Counted per day. */
export async function POST(request: Request) {
  let postId = 0;
  try {
    postId = Number((JSON.parse(await request.text()) as { postId?: unknown }).postId);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!Number.isInteger(postId) || postId <= 0) return new Response(null, { status: 400 });
  const d = await db();
  const [post] = await d
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.status, "published")));
  if (!post) return new Response(null, { status: 404 });
  const day = new Date().toISOString().slice(0, 10);
  await d
    .insert(postViews)
    .values({ postId, day, count: 1 })
    .onConflictDoUpdate({
      target: [postViews.postId, postViews.day],
      set: { count: sql`${postViews.count} + 1` },
    });
  return new Response(null, { status: 204 });
}
