import { HowItWorks } from "@/components/HowItWorks";
import { Rail } from "@/components/Rail";
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
      <div className="page-head">
        <p className="kicker">{event.day}</p>
        <h1>Schedule</h1>
        <p className="dek">
          One room, one track, no clashes. Times are {event.city} time. Talks run 40 minutes with five for
          questions.
        </p>
      </div>
      <p className="status">
        <span>
          Published <time dateTime={new Date(publishedAt).toISOString()}>{stamp(publishedAt)}</time>
        </span>
        <span>
          This copy generated{" "}
          <time id="generated" dateTime={generated.toISOString()}>
            {stamp(generated)}
          </time>
        </span>
        <span>{program.length} slots</span>
      </p>
      <Rail slots={program} />
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
