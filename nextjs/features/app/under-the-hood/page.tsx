import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { FeatureHint } from "@/components/FeatureHint";
import { NeedsBucket, NeedsDatabase } from "@/components/Notice";
import { Steps } from "@/components/Steps";
import { hasDatabase } from "@/lib/db";
import { features, hintsFor } from "@/lib/features";
import { hasStorage } from "@/lib/storage";
import { measureStorage } from "@/lib/storage-timing";
import { measure } from "@/lib/timing";

export const metadata = { title: "Under the hood" };
// The measurements run on each visit, and the bindings are read at request time.
export const dynamic = "force-dynamic";

export default async function UnderTheHood() {
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Under the hood</p>
        <h1>How this site works</h1>
        <p className="lead">
          Hydrate is a demo. Each page does one real job with a Next.js feature, running on swarza. Here is
          which feature, which part of swarza and where the code is. Below that, the database and the bucket
          are timed from inside the app, live. On the other pages, the pulsing dots show the same, next to the
          thing that uses it.
        </p>
      </header>

      <section>
        <div className="section-head">
          <h2>Page by page</h2>
          <span className="section-more muted">{features.length} parts</span>
        </div>
        <ol className="map">
          {features.map((f) => {
            const tries = hintsFor(f.id);
            return (
              <li key={f.id} id={f.id}>
                <div className="map-page">
                  <h3>{f.href ? <Link href={f.href}>{f.label}</Link> : f.label}</h3>
                  <code>{f.path}</code>
                </div>
                <dl className="map-cols">
                  <div>
                    <dt>Next.js</dt>
                    <dd>{f.next}</dd>
                  </div>
                  <div>
                    <dt>swarza</dt>
                    <dd>{f.swarza}</dd>
                  </div>
                  <div>
                    <dt>Code</dt>
                    <dd className="code-list">
                      {f.code.map((c) => (
                        <code key={c}>{c}</code>
                      ))}
                    </dd>
                  </div>
                  {tries.length ? (
                    <div className="map-try">
                      <dt>Try it</dt>
                      <dd>
                        {tries.map((t) => (
                          <div key={t.id} className="map-try-item">
                            <p className="map-try-title">{t.title}</p>
                            <Steps steps={t.test} origin={origin} className="steps" />
                          </div>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="database">
        <div className="section-head">
          <h2>
            The database, measured just now
            <FeatureHint id="timings" />
          </h2>
          <a href="/api/db" className="section-more">
            JSON →
          </a>
        </div>
        <p className="note">
          Each call 20 times in a row, from this app to its database. Milliseconds as the app sees them:
          network, database and client together. The median is the big number; p90 and the slowest follow.
        </p>
        <Suspense fallback={<p className="waiting">Measuring the database…</p>}>
          <DatabaseTimings />
        </Suspense>
      </section>

      <section id="storage">
        <div className="section-head">
          <h2>The bucket, measured just now</h2>
          <a href="/api/storage" className="section-more">
            JSON, all sizes →
          </a>
        </div>
        <p className="note">
          Small objects written, read and deleted five times each, then a HEAD and a list. The JSON endpoint
          also times 1 MB objects.
        </p>
        <Suspense fallback={<p className="waiting">Measuring the bucket…</p>}>
          <StorageTimings />
        </Suspense>
      </section>

      <section id="endpoints">
        <div className="section-head">
          <h2>Try it from a terminal</h2>
        </div>
        <ul className="commands">
          <li>
            <code>curl {origin}/schedule.json</code>
            <span>The program as JSON (a rewrite to /api/schedule, Node.js runtime).</span>
          </li>
          <li>
            <code>curl {origin}/api/now</code>
            <span>What is on stage now, from the edge runtime.</span>
          </li>
          <li>
            <code>curl -X POST {origin}/api/revalidate</code>
            <span>Publish the program again: the schedule and talk pages regenerate.</span>
          </li>
          <li>
            <code>curl -I {origin}/live</code>
            <span>A redirect to /now, made by proxy.ts.</span>
          </li>
          <li>
            <code>curl {origin}/api/db?n=50</code>
            <span>Database timings with more calls.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

type Row = { name: string; p50: number; p90: number; max: number; cpu?: number };

function Timings({ rows }: { rows: Row[] }) {
  const top = Math.max(...rows.map((r) => r.p90));
  return (
    <ol className="timings">
      {rows.map((r) => (
        <li key={r.name}>
          <span className="timing-name">{r.name}</span>
          <span className="timing-p50">
            {r.p50.toFixed(2)}
            <small> ms</small>
          </span>
          <span className="timing-rest">
            p90 {r.p90.toFixed(2)} · max {r.max.toFixed(2)}
            {r.cpu !== undefined ? ` · CPU ${r.cpu.toFixed(2)}` : ""}
          </span>
          <span className="bar" aria-hidden="true">
            <span className="bar-p90" style={{ width: `${(r.p90 / top) * 100}%` }} />
            <span className="bar-p50" style={{ width: `${(r.p50 / top) * 100}%` }} />
          </span>
        </li>
      ))}
    </ol>
  );
}

async function DatabaseTimings() {
  if (!hasDatabase()) return <NeedsDatabase what="The timings run against the bound database." />;
  try {
    return (
      <>
        <Timings rows={await measure(20)} />
        <p className="note">
          On a small plan the app gets part of a CPU core: a burst of calls can use up its share and wait for
          the next 100 ms, which shows as a higher max.
        </p>
      </>
    );
  } catch (e) {
    return <p className="note">Could not measure: {e instanceof Error ? e.message : String(e)}</p>;
  }
}

async function StorageTimings() {
  if (!hasStorage()) return <NeedsBucket what="The timings run against the bound bucket." />;
  try {
    return <Timings rows={await measureStorage(5, ["1 KB", "100 KB"])} />;
  } catch (e) {
    return <p className="note">Could not measure: {e instanceof Error ? e.message : String(e)}</p>;
  }
}
