import Link from "next/link";
import { notFound } from "next/navigation";
import { add } from "@/app/agenda/actions";
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
        <p className="kicker">
          {kindLabel[talk.kind]} · {talk.start}–{talk.end} · Hall A
        </p>
        <h1>{talk.title}</h1>
        {talk.speaker ? (
          <p className="dek">
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
            <button type="submit" className="btn">
              Add to my agenda
            </button>
            <Link href="/schedule" className="btn btn-line">
              Back to the schedule
            </Link>
          </form>
        </div>
        {talk.speaker ? (
          <aside className="speaker-card">
            <Monogram name={talk.speaker.name} />
            <div>
              <p className="speaker-name">{talk.speaker.name}</p>
              <p className="byline">{talk.speaker.role}</p>
            </div>
            <p>{talk.speaker.bio}</p>
          </aside>
        ) : null}
      </div>
      <nav className="pager" aria-label="Talks">
        {prev ? <Link href={`/talks/${prev.slug}`}>← {prev.title}</Link> : <span />}
        {next ? <Link href={`/talks/${next.slug}`}>{next.title} →</Link> : <span />}
      </nav>
      <HowItWorks id="talks">
        <p>
          {talk.late
            ? "This talk was announced after the build, so this page was rendered on its first request"
            : "This page was prerendered by next build"}{" "}
          at{" "}
          <time id="rendered" dateTime={rendered.toISOString()}>
            {stamp(rendered)}
          </time>{" "}
          and is regenerated at most once an hour.
        </p>
      </HowItWorks>
    </article>
  );
}
