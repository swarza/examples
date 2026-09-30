/**
 * Measures database calls from inside the app: each case runs `n` times in a row after a short
 * warm-up. Times are wall-clock milliseconds as the app sees them (network, database and client
 * together); `cpu` is this app's own CPU time per call (the client's work).
 */
import { desc, eq, sql } from "drizzle-orm";
import { client, db } from "./db";
import { entries, hits } from "./schema";

export type Timing = { name: string; p50: number; p90: number; max: number; avg: number; cpu: number };

const round = (ms: number) => Math.round(ms * 1000) / 1000;

async function time(name: string, n: number, fn: () => Promise<unknown>): Promise<Timing> {
  for (let i = 0; i < 5; i++) await fn();
  const times: number[] = [];
  const cpu = process.cpuUsage();
  for (let i = 0; i < n; i++) {
    const started = performance.now();
    await fn();
    times.push(performance.now() - started);
  }
  const used = process.cpuUsage(cpu);
  const sorted = [...times].sort((a, b) => a - b);
  return {
    name,
    p50: round(sorted[Math.floor(n * 0.5)]!),
    p90: round(sorted[Math.floor(n * 0.9)]!),
    max: round(sorted[n - 1]!),
    avg: round(times.reduce((a, b) => a + b, 0) / n),
    cpu: round((used.user + used.system) / 1000 / n),
  };
}

export async function measure(n = 30): Promise<Timing[]> {
  const d = db();
  const results = [
    await time("SELECT 1 (libSQL client)", n, () => client().execute("SELECT 1")),
    await time("Read 20 rows (Drizzle)", n, () =>
      d.select().from(entries).orderBy(desc(entries.id)).limit(20),
    ),
    await time("Count rows (Drizzle)", n, () => d.$count(entries)),
    await time("Insert a row", n, () => d.insert(hits).values({ path: "/db", at: new Date() })),
    await time("Transaction: insert and update", n, () =>
      d.transaction(async (tx) => {
        const [row] = await tx
          .insert(hits)
          .values({ path: "/db", at: new Date() })
          .returning({ id: hits.id });
        await tx.update(hits).set({ path: "/db (updated)" }).where(eq(hits.id, row!.id));
      }),
    ),
    await time("Batch: 3 statements in one round trip", n, () =>
      d.batch([
        d.insert(hits).values({ path: "/db", at: new Date() }),
        d.select({ n: sql<number>`count(*)` }).from(hits),
        d.select().from(entries).limit(1),
      ]),
    ),
  ];
  // Keep the table small.
  await d.delete(hits).where(sql`${hits.id} <= (SELECT max(id) - 1000 FROM hits)`);
  return results;
}
