import Link from "next/link";
import { event } from "@/lib/program";
import { Dither } from "./Dither";
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

export function Logo({ className = "logo" }: { className?: string }) {
  return (
    <Link href="/" className={className} aria-label={`${event.name} ${event.edition}, home`}>
      {event.name}
      <span className="logo-ed">{event.edition}</span>
    </Link>
  );
}

export function Masthead() {
  return (
    <header className="masthead">
      <div className="wrap">
        <div className="mast-top">
          <Logo />
          <div className="mast-meta">
            <span>Sat 14 Nov 2026</span>
            <span>
              {event.venue}, {event.city}
            </span>
          </div>
        </div>
        <NavLinks links={sections} />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-brand">
            <Logo />
            <p>
              {event.name} is a made-up conference. This site is the Next.js example for swarza: each page
              shows a Next.js feature doing a real job, on swarza&apos;s hosting, database and storage.
            </p>
          </div>
          <ul aria-label="The event">
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
          <ul aria-label="How it is built">
            <li>
              <Link href="/under-the-hood">Under the hood</Link>
            </li>
            <li>
              <a href="/api/schedule">/api/schedule</a>
            </li>
            <li>
              <a href="/api/now">/api/now (edge)</a>
            </li>
            <li>
              <a href="https://github.com/swarza/examples">Source on GitHub</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-strip">
        <Dither tone="heat" className="dither-strip" />
        <div className="wrap footer-strip-text">
          <span>Hosted on swarza</span>
          <span>Next.js with @swarza/next</span>
        </div>
      </div>
    </footer>
  );
}
