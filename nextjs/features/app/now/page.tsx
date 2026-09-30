import { desc } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { FeatureHint } from "@/components/FeatureHint";
import { HowItWorks } from "@/components/HowItWorks";
import { db, hasDatabase } from "@/lib/db";
import { event, slotAt, stamp, talks, venueClock, type Slot } from "@/lib/program";
import { entries } from "@/lib/schema";

export const metadata = { title: "Live board" };

/**
 * Rendered on every request: it reads the request's headers and cookies. The questions and the
 * wall stream in after the rest of the page, each in its own Suspense boundary.
 */
export default async function Now() {
  const h = await headers();
  const jar = await cookies();
  // proxy.ts counts visits in a cookie and passes the new count on as x-visit.
  const visit = Number(h.get("x-visit") ?? jar.get("visits")?.value ?? 1);
  const at = new Date();
  const { now, next } = slotAt(at);
  const asked = [now, next, ...talks].find((s) => s?.questions);
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">
          <span className="live">Live</span>
          {venueClock(at).slice(0, 5)} in {event.city}
        </p>
        <h1>{now ? now.title : "Nothing on stage right now"}</h1>
        <p className="lead">{describe(now, next)}</p>
        <p className="badge-link">
          <span className="label">On your badge</span>
          <code>{h.get("host")}/live</code>
          <FeatureHint id="proxy" />
        </p>
      </header>
      <div className="split">
        <div className="main stack">
          {next ? (
            <div className="up-next">
              <span className="up-next-tags">
                <span className="label">Up next</span>
                <time className="time-badge">{next.start}</time>
              </span>
              {next.kind === "break" ? (
                <span className="up-next-title">{next.title}</span>
              ) : (
                <Link href={`/talks/${next.slug}`} className="up-next-title">
                  {next.title}
                </Link>
              )}
              {next.speaker ? <span className="speaker-role">{next.speaker.name}</span> : null}
            </div>
          ) : null}
          <section>
            <div className="section-head">
              <h2>
                Questions from the room
                <FeatureHint id="streaming" />
              </h2>
              <span className="section-more muted">{asked?.title}</span>
            </div>
            <Suspense fallback={<Waiting label="Collecting questions" />}>
              <Questions slot={asked} />
            </Suspense>
          </section>
          <section>
            <div className="section-head">
              <h2>Just signed the wall</h2>
              <Link href="/guestbook" className="section-more">
                Sign it →
              </Link>
            </div>
            <Suspense fallback={<Waiting label="Reading the wall" />}>
              <LatestSignatures />
            </Suspense>
          </section>
          <p className="note">
            On {event.day} this board follows the day. Until then it plays the program on today&apos;s clock
            in {event.city}, so there is always something on.
          </p>
        </div>
        <aside className="side">
          <div className="panel">
            <span className="label">Your request</span>
            <dl className="readout">
              <div>
                <dt>Rendered</dt>
                <dd>
                  <time id="now" dateTime={at.toISOString()}>
                    {stamp(at)}
                  </time>
                  <FeatureHint id="dynamic" />
                </dd>
              </div>
              <div>
                <dt>Your visit</dt>
                <dd id="visits">
                  {visit === 1 ? "First time here. Welcome." : `Number ${visit}. Welcome back.`}
                </dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>
                  <span id="country">{h.get("x-country") ?? "unknown"}</span>
                  <FeatureHint id="geo" />
                </dd>
              </div>
              <div>
                <dt>Host</dt>
                <dd id="host">{h.get("host")}</dd>
              </div>
              <div>
                <dt>Browser</dt>
                <dd>{browser(h.get("user-agent"))}</dd>
              </div>
            </dl>
            <p className="panel-note">
              Read from this request&apos;s headers and cookies. Reload and the visit count goes up.
            </p>
          </div>
        </aside>
      </div>
      <HowItWorks id="now" />
    </div>
  );
}

function describe(now?: Slot, next?: Slot) {
  if (!now) return next ? `Doors open at ${next.start}.` : "That was the day. Doors open again at 08:30.";
  if (now.kind === "break") return `Until ${now.end}. ${next ? `Then: ${next.title}.` : ""}`;
  return `${now.speaker ? `${now.speaker.name}, ` : ""}on stage until ${now.end}.`;
}

function browser(ua: string | null) {
  if (!ua) return "unknown";
  if (/HeadlessChrome/.test(ua)) return "Headless Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  if (/curl\//.test(ua)) return "curl";
  return "something else";
}

function Waiting({ label }: { label: string }) {
  return (
    <p className="waiting" aria-busy="true">
      {label}…
    </p>
  );
}

/** Stands in for a slow service: it waits 1.2 seconds on purpose, and the rest of the page does not. */
async function Questions({ slot }: { slot?: Slot }) {
  await new Promise((r) => setTimeout(r, 1200));
  const questions = slot?.questions ?? [];
  return (
    <ol className="questions" id="questions">
      {questions.map((q, i) => (
        <li key={q}>
          <p>{q}</p>
          <span className="meta">
            {3 + ((i * 7) % 11)} votes · asked from row {2 + ((i * 5) % 14)}
          </span>
        </li>
      ))}
    </ol>
  );
}

async function LatestSignatures() {
  if (!hasDatabase())
    return (
      <p className="note">
        Bind a database to see the latest names from the <Link href="/guestbook">attendee wall</Link> here.
      </p>
    );
  try {
    const rows = await db().select().from(entries).orderBy(desc(entries.id)).limit(4);
    if (!rows.length) return <p className="note">No one yet. Be the first.</p>;
    return (
      <ul className="mini-wall">
        {rows.map((e) => (
          <li key={e.id}>
            <span className="speaker-name">{e.name}</span>
            <span className="meta">{e.message}</span>
          </li>
        ))}
      </ul>
    );
  } catch {
    return <p className="note">The wall&apos;s table is missing. Run the migrations (see the README).</p>;
  }
}
