import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { FeatureHint } from "@/components/FeatureHint";
import { HowItWorks } from "@/components/HowItWorks";
import { NeedsDatabase, Notice } from "@/components/Notice";
import { db, hasDatabase } from "@/lib/db";
import { stamp } from "@/lib/program";
import { entries } from "@/lib/schema";

export const metadata = { title: "Attendee wall" };
export const dynamic = "force-dynamic";

async function sign(form: FormData) {
  "use server";
  const name = String(form.get("name") ?? "")
    .trim()
    .slice(0, 80);
  const message = String(form.get("message") ?? "")
    .trim()
    .slice(0, 500);
  if (!name || !message) return;
  await db().insert(entries).values({ name, message, createdAt: new Date() });
  revalidatePath("/guestbook");
}

/** The attendee wall: RSVPs in the `entries` table of the bound database, read with Drizzle. */
export default async function Guestbook() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">RSVP · tickets are free</p>
        <h1>The attendee wall</h1>
        <p className="lead">
          Coming? Sign the wall with your name and one thing you hope to take home from the day.
        </p>
        <p className="head-note">
          The front desk gets a head count in its logs every five minutes.
          <FeatureHint id="jobs" />
        </p>
      </header>
      <Wall />
      <HowItWorks id="wall" />
    </div>
  );
}

async function Wall() {
  if (!hasDatabase())
    return <NeedsDatabase what="The wall keeps its signatures in a database." hint="wall" />;

  let rows: (typeof entries.$inferSelect)[];
  let count: number;
  let ms: number;
  try {
    const started = performance.now();
    rows = await db().select().from(entries).orderBy(desc(entries.id)).limit(24);
    count = await db().$count(entries);
    ms = performance.now() - started;
  } catch (e) {
    return (
      <Notice title="The database has no wall yet">
        <p>
          A database is bound, but reading the <code>entries</code> table failed. Run the migrations once:
        </p>
        <pre>
          <code>DATABASE_URL=… DATABASE_AUTH_TOKEN=… npm run db:migrate</code>
        </pre>
        <p className="muted">{e instanceof Error ? e.message : String(e)}</p>
      </Notice>
    );
  }

  return (
    <>
      <div className="wall-top">
        <div className="stat">
          <p className="stat-num">
            <span id="count">{count}</span>
            <FeatureHint id="db-read" />
          </p>
          <p className="stat-label">
            {count === 1 ? "person has" : "people have"} signed. Read in{" "}
            <span id="query-ms">{ms.toFixed(2)}</span> ms (two queries).
          </p>
        </div>
        <form action={sign} className="form">
          <label>
            <span>Your name</span>
            <input name="name" required maxLength={80} autoComplete="name" placeholder="Ada Kowal" />
          </label>
          <label>
            <span>What you hope to take home</span>
            <input name="message" required maxLength={500} placeholder="How to cache without fear" />
          </label>
          <span className="form-submit">
            <button type="submit" className="btn">
              Sign the wall
            </button>
            <FeatureHint id="wall" />
          </span>
        </form>
      </div>
      {rows.length ? (
        <ul className="wall" id="entries">
          {rows.map((e) => (
            <li key={e.id}>
              <p className="wall-message">{e.message}</p>
              <p className="wall-meta">
                <span className="wall-name">{e.name}</span>
                <time dateTime={e.createdAt.toISOString()}>{stamp(e.createdAt)}</time>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="note" id="entries">
          No one has signed yet. Be the first.
        </p>
      )}
    </>
  );
}
