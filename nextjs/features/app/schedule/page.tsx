import { FeatureHint } from "@/components/FeatureHint";
import { HowItWorks } from "@/components/HowItWorks";
import { Tickets } from "@/components/Tickets";
import { event, stamp } from "@/lib/program";
import { getSchedule } from "@/lib/schedule";

/** Incremental Static Regeneration: served from the cache, rendered again at most every 30 seconds. */
export const revalidate = 30;
export const metadata = { title: "Schedule" };

export default async function Schedule() {
  const { publishedAt, program } = await getSchedule();
  const generated = new Date();
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">{event.day}</p>
        <h1>Schedule</h1>
        <p className="lead">
          One room, one track, no clashes. Times are {event.city} time. Talks run 40 minutes with five for
          questions.
        </p>
      </header>
      <div className="status-bar">
        <span className="status-item">
          <span className="label">Published</span>
          <time dateTime={new Date(publishedAt).toISOString()}>{stamp(publishedAt)}</time>
          <FeatureHint id="revalidate" />
        </span>
        <span className="status-item">
          <span className="label">This copy generated</span>
          <time id="generated" dateTime={generated.toISOString()}>
            {stamp(generated)}
          </time>
          <FeatureHint id="isr" />
        </span>
        <span className="status-item">
          <span className="label">Slots</span>
          {program.length}
        </span>
      </div>
      <Tickets slots={program} hints />
      <HowItWorks id="schedule">
        <p>
          Organisers publish a change with <code>curl -X POST {"<site>"}/api/revalidate</code>. The next visit
          still gets this copy while a new one renders; the one after gets the new copy, with a new
          &ldquo;Published&rdquo; time. Here the program lives in <code>lib/program.ts</code>, so only the
          time changes.
        </p>
      </HowItWorks>
    </div>
  );
}
