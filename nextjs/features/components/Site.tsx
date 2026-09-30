import Link from "next/link";
import { event } from "@/lib/program";
import { FeatureHint } from "./FeatureHint";
import { HintsToggle } from "./HintsToggle";
import { NavLinks } from "./NavLinks";

const sections = [
  { href: "/schedule", label: "Schedule" },
  { href: "/now", label: "Live" },
  { href: "/agenda", label: "My agenda" },
  { href: "/venue", label: "Venue" },
  { href: "/guestbook", label: "Attendee wall" },
  { href: "/uploads", label: "Photos" },
  { href: "/under-the-hood", label: "Under the hood" },
];

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label={`${event.name} ${event.edition}, home`}>
      {event.name}
      <span className="logo-ed">{event.edition}</span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="header">
      <div className="wrap header-inner">
        <Logo />
        <NavLinks links={sections} />
        <HintsToggle />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <Logo />
          <p>
            {event.day}. {event.address}.
          </p>
          <p className="footer-small">
            {event.name} is a made-up conference. This site is the Next.js example for swarza: each page does
            a real job with a Next.js feature, on swarza&apos;s hosting, database and storage. Look for the
            pulsing dots.
          </p>
        </div>
        <div className="footer-col">
          <h2>The event</h2>
          <ul>
            <li>
              <Link href="/schedule">Schedule</Link>
            </li>
            <li>
              <Link href="/now">Live board</Link>
            </li>
            <li>
              <Link href="/agenda">My agenda</Link>
            </li>
            <li>
              <Link href="/venue">Venue</Link>
            </li>
            <li>
              <Link href="/guestbook">Attendee wall</Link>
            </li>
            <li>
              <Link href="/uploads">Photos</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h2>For developers</h2>
          <ul>
            <li>
              <Link href="/under-the-hood">Under the hood</Link>
            </li>
            <li>
              <a href="/schedule.json">Program as JSON</a>
              <FeatureHint id="route-node" />
            </li>
            <li>
              <a href="/api/now">On stage now, from the edge</a>
              <FeatureHint id="edge" />
            </li>
            <li>
              <a href="https://github.com/swarza/examples">Source on GitHub</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-base">
        <span>Hosted on swarza</span>
        <span>Next.js with @swarza/next</span>
      </div>
    </footer>
  );
}
