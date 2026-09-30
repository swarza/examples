import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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
      <div className="page-head">
        <p className="kicker">RSVP</p>
        <h1>The attendee wall</h1>
        <p className="dek">
          Tickets are free. Coming? Sign the wall with your name and one thing you hope to take home from the
          day.
        </p>
      </div>
      <Wall />
      <HowItWorks id="wall" />
    </div>
  );
}

async function Wall() {
  if (!hasDatabase()) return <NeedsDatabase what="The wall keeps its signatures in a database." />;

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
        <p className="stat">
          <span className="stat-num" id="count">
            {count}
          </span>
          <span className="stat-label">
            {count === 1 ? "person has" : "people have"} signed. Read in{" "}
            <span id="query-ms">{ms.toFixed(2)}</span> ms (two queries).
          </span>
        </p>
        <form action={sign} className="form">
          <label>
            <span>Your name</span>
            <input name="name" required maxLength={80} autoComplete="name" placeholder="Ada Kowal" />
          </label>
          <label>
            <span>What you hope to take home</span>
            <input name="message" required maxLength={500} placeholder="How to cache without fear" />
          </label>
          <button type="submit" className="btn">
            Sign the wall
          </button>
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
        <p className="note-line" id="entries">
          No one has signed yet. Be the first.
        </p>
      )}
    </>
  );
}
