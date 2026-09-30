import Link from "next/link";
import { notFound } from "next/navigation";
import { add } from "@/app/agenda/actions";
import { FeatureHint } from "@/components/FeatureHint";
import { HowItWorks } from "@/components/HowItWorks";
import { Monogram } from "@/components/Monogram";
import { getTalk, kindLabel, stamp, talks } from "@/lib/program";

export const revalidate = 3600;

/** A page per talk at build time, except talks announced later: those render on their first request. */
export async function generateStaticParams() {
  return talks.filter((t) => !t.late).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: getTalk((await params).slug)?.title ?? "Not found" };
}

export default async function Talk({ params }: { params: Promise<{ slug: string }> }) {
  const talk = getTalk((await params).slug);
  if (!talk) notFound();
  const i = talks.indexOf(talk);
  const prev = talks[i - 1];
  const next = talks[i + 1];
  const rendered = new Date();
  return (
    <article className="page talk">
      <header className="page-head">
        <p className="ticket-tags">
          <span className="time-badge">
            {talk.start} to {talk.end}
          </span>
          <span className={`pill pill-${talk.kind}`}>{kindLabel[talk.kind]}</span>
          <span className="pill pill-quiet">Hall A</span>
        </p>
        <h1>{talk.title}</h1>
        {talk.speaker ? (
          <p className="lead">
            {talk.speaker.name}, {talk.speaker.role}
          </p>
        ) : null}
      </header>
      <div className="talk-grid">
        <div className="prose">
          {talk.abstract?.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <form action={add} className="actions">
            <input type="hidden" name="slug" value={talk.slug} />
            <button type="submit" className="btn btn-heat">
              Add to my agenda
            </button>
            <FeatureHint id="agenda-add" />
            <Link href="/schedule" className="btn btn-line">
              Back to the schedule
            </Link>
          </form>
        </div>
        <aside className="side-card">
          {talk.speaker ? (
            <>
              <div className="side-card-who">
                <Monogram name={talk.speaker.name} />
                <div>
                  <p className="speaker-name">{talk.speaker.name}</p>
                  <p className="speaker-role">{talk.speaker.role}</p>
                </div>
              </div>
              <p>{talk.speaker.bio}</p>
            </>
          ) : (
            <p>Five speakers, five minutes each, picked from the proposals sent in on the day.</p>
          )}
          <p className="side-card-meta">
            <span className="label">{talk.late ? "Rendered on first request" : "Prerendered at build"}</span>
            <time id="rendered" dateTime={rendered.toISOString()}>
              {stamp(rendered)}
            </time>
            <FeatureHint id={talk.late ? "on-demand" : "static-params"} />
          </p>
        </aside>
      </div>
      <nav className="pager" aria-label="Talks">
        {prev ? (
          <Link href={`/talks/${prev.slug}`}>
            <span className="label">Before</span>
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/talks/${next.slug}`} className="pager-next">
            <span className="label">After</span>
            {next.title}
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <HowItWorks id="talks">
        <p>
          {talk.late
            ? "This talk was announced after the build, so this page was rendered on its first request."
            : "This page was prerendered by next build."}{" "}
          It is regenerated at most once an hour.
        </p>
      </HowItWorks>
    </article>
  );
}
