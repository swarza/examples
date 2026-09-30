import Image from "next/image";
import Link from "next/link";
import { Dither } from "@/components/Dither";
import { FeatureHint } from "@/components/FeatureHint";
import { HowItWorks } from "@/components/HowItWorks";
import { Monogram } from "@/components/Monogram";
import { event, kindLabel, speakers, stamp, talks } from "@/lib/program";
import hall from "./venue/hall.jpg";

/** The landing page: nothing on it changes per visitor, so next build prerenders it once. */
export default function Home() {
  const built = new Date();
  return (
    <div className="home">
      <section className="hero">
        <Dither className="dither-hero" />
        <div className="hero-content">
          <p className="hero-tags">
            <span className="pill pill-heat">Sat 14 Nov 2026</span>
            <span className="pill pill-glass">{event.city}</span>
            <span className="pill pill-glass">One day, one track</span>
          </p>
          <h1 className="hero-title">
            {event.name}
            <span className="hero-ed">{event.edition}</span>
          </h1>
          <p className="hero-lead">
            A conference about building fast, plain websites. Eight talks and an hour of lightning talks in an
            old tram depot in {event.city}.
          </p>
          <div className="actions">
            <Link href="/schedule" className="btn btn-heat">
              See the schedule
            </Link>
            <Link href="/guestbook" className="btn btn-glass">
              Sign the attendee wall
            </Link>
          </div>
        </div>
        <p className="hero-built">
          <span>
            Page built{" "}
            <time id="built" dateTime={built.toISOString()}>
              {stamp(built)}
            </time>
          </span>
          <FeatureHint id="static" />
        </p>
      </section>

      <dl className="facts">
        <div>
          <dt>When</dt>
          <dd>Saturday 14 November</dd>
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
          <dd>
            Free. RSVP at{" "}
            <a href="/rsvp" className="link">
              /rsvp
            </a>
            <FeatureHint id="redirects" />
          </dd>
        </div>
      </dl>

      <section>
        <div className="section-head">
          <h2>What&apos;s on</h2>
          <Link href="/schedule" className="section-more">
            Full schedule →
          </Link>
        </div>
        <ul className="cards">
          {talks.map((t) => (
            <li key={t.slug}>
              <Link href={`/talks/${t.slug}`} className="card-talk">
                <span className="card-top">
                  <time className="time-badge">{t.start}</time>
                  <span className={`pill pill-${t.kind}`}>{kindLabel[t.kind]}</span>
                </span>
                <span className="card-title">{t.title}</span>
                <span className="card-who">{t.speaker?.name ?? "Speakers picked on the day"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

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
                <span className="speaker-role">{s.role}</span>
                <span className="speaker-talk">{s.talk.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="venue-card">
        <div className="venue-photo">
          <Image src={hall} alt="Hall A seen from the back row" sizes="(max-width: 900px) 100vw, 640px" />
          <FeatureHint id="image" corner />
        </div>
        <div className="venue-text">
          <span className="label">The venue</span>
          <h2>Hall A, The Depot</h2>
          <p>
            400 seats in a tram shed from 1913. Step-free, with a hearing loop and a quiet room, ten minutes
            by tram from the main station.
          </p>
          <Link href="/venue" className="btn btn-line">
            Getting there
          </Link>
        </div>
      </section>

      <HowItWorks id="home" />
    </div>
  );
}
