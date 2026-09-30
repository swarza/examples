/**
 * Every hour at :07 (swarza.json): adds up each story's reads over the last 7 days for the
 * "Most read" list, and deletes daily counts older than 30 days.
 */
import { client, db } from "@/lib/db";
import { refreshSite } from "./refresh";

const day = (msAgo: number) => new Date(Date.now() - msAgo).toISOString().slice(0, 10);

export default async function mostRead() {
  if (!process.env.DATABASE_URL) return console.log("no database bound");
  await db();
  const since = day(6 * 86_400_000);
  await client().batch(
    [
      {
        sql: "update posts set reads_7d = coalesce((select sum(count) from post_views v where v.post_id = posts.id and v.day >= ?), 0)",
        args: [since],
      },
      { sql: "delete from post_views where day < ?", args: [day(30 * 86_400_000)] },
    ],
    "write",
  );
  const { rows } = await client().execute(
    "select title, reads_7d as reads from posts where status = 'published' order by reads_7d desc limit 1",
  );
  await refreshSite(
    rows[0] ? `ranked reads; top story "${rows[0].title}" (${rows[0].reads})` : "ranked reads",
  );
}
