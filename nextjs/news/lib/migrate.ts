import type { Client } from "@libsql/client/web";
import { migrations } from "./migrations.generated";

/**
 * Applies the embedded migrations (drizzle/) that this database hasn't seen, each in one batch
 * (a transaction). Safe to run from several workers at once: a migration another worker applied
 * first is skipped.
 */
export async function migrate(client: Client) {
  await client.execute(
    "create table if not exists __migrations (tag text primary key, applied_at integer not null)",
  );
  const { rows } = await client.execute("select tag from __migrations");
  const applied = new Set(rows.map((r) => String(r.tag)));
  for (const m of migrations) {
    if (applied.has(m.tag)) continue;
    try {
      await client.batch(
        [
          ...m.statements,
          { sql: "insert into __migrations (tag, applied_at) values (?, ?)", args: [m.tag, Date.now()] },
        ],
        "write",
      );
      console.log(`migrated: ${m.tag}`);
    } catch (e) {
      const { rows: again } = await client.execute({
        sql: "select 1 from __migrations where tag = ?",
        args: [m.tag],
      });
      if (!again.length) throw e;
    }
  }
}
