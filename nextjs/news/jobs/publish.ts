/**
 * Every minute (swarza.json): publishes scheduled stories whose time has come. swarza calls this
 * function on its schedule with the application's variables and database; it has no URL.
 */
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { refreshSite } from "./refresh";

export default async function publish() {
  if (!process.env.DATABASE_URL) return console.log("no database bound");
  const d = await db();
  // Only stories whose time has passed: never early, at most a minute late.
  const now = Date.now();
  const due = await d
    .update(posts)
    .set({ status: "published", updatedAt: now })
    .where(and(eq(posts.status, "scheduled"), lte(posts.publishedAt, now)))
    .returning({ title: posts.title });
  if (!due.length) return;
  await refreshSite(`published ${due.map((p) => `"${p.title}"`).join(", ")}`);
}
