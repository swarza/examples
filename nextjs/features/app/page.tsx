import Image from "next/image";
import Link from "next/link";
import { Dither } from "@/components/Dither";
import { HowItWorks } from "@/components/HowItWorks";
import { Monogram } from "@/components/Monogram";
import { Rail } from "@/components/Rail";
import { event, speakers, talks } from "@/lib/program";
import hall from "./venue/hall.jpg";

/** The landing page: nothing on it changes per visitor, so next build prerenders it once. */
export default function Home() {
  return (
    <div className="home">
      <div className="lead">
        <section className="hero">
          <p className="kicker">A one-day web conference · a demo event</p>
          <h1 className="hero-title">
            {event.name}
            <em>{event.edition}</em>
          </h1>
          <p className="hero-dek">
            Eight talks and an hour of lightning talks about building fast, plain websites. One room, one
            track, in an old tram depot in {event.city}.
          </p>
          <div className="actions">
            <Link href="/schedule" className="btn">
              See the schedule
            </Link>
            <Link href="/guestbook" className="btn btn-line">
              Sign the attendee wall
            </Link>
          </div>
        </section>

        <Dither className="dither-hero" />

        <dl className="facts">
          <div>
            <dt>When</dt>
            <dd>Sat 14 Nov 2026</dd>
          </div>
          <div>
            <dt>Doors</dt>
            <dd>08:30 to 20:00</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              {event.venue}, {event.city}
            </dd>
          </div>
          <div>
            <dt>Tickets</dt>
            <dd>Free, sign the wall</dd>
          </div>
        </dl>
      </div>

      <div className="split">
        <section className="main">
          <div className="section-head">
            <h2>What&apos;s on</h2>
            <Link href="/schedule" className="section-more">
              Full schedule →
            </Link>
          </div>
          <Rail slots={talks} />
        </section>
        <section className="side">
          <div className="section-head">
            <h2>The venue</h2>
            <Link href="/venue" className="section-more">
              Getting there →
            </Link>
          </div>
          <Link href="/venue" className="venue-teaser">
            <Image src={hall} alt="Hall A seen from the back row" sizes="(max-width: 900px) 100vw, 400px" />
            <span className="title">Hall A, The Depot</span>
            <span className="byline">400 seats, step-free, ten minutes by tram from the main station.</span>
          </Link>
        </section>
      </div>

      <section>
        <div className="section-head">
          <h2>Speakers</h2>
          <span className="section-more muted">{speakers.length} people</span>
        </div>
        <ul className="speakers">
          {speakers.map((s) => (
            <li key={s.name}>
              <Link href={`/talks/${s.talk.slug}`} className="speaker">
                <Monogram name={s.name} />
                <span className="speaker-name">{s.name}</span>
                <span className="byline">{s.role}</span>
                <span className="speaker-talk">{s.talk.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <HowItWorks id="home">
        <p>
          This copy was rendered at <time id="built">{new Date().toISOString()}</time>, when the site was
          built.
        </p>
      </HowItWorks>
    </div>
  );
}
