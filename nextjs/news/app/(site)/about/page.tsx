import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };
// The masthead lists the sections from the database, which the build has no access to.
export const dynamic = "force-dynamic";

const features: [string, string][] = [
  [
    "Next.js on the runtime",
    "Pages are server-rendered and cached. Stories use incremental regeneration; the front page streams its reading list in.",
  ],
  [
    "A database",
    "Stories, sections, editors and messages live in the application's swarza database, with migrations applied on first use.",
  ],
  [
    "A storage bucket",
    "Covers are uploaded from the newsroom to a public bucket and served from its CDN address.",
  ],
  [
    "Scheduled jobs",
    "One job publishes scheduled stories every minute; another ranks what people read, every hour.",
  ],
  [
    "Variables and secrets",
    "The session secret and the first editor's sign-in are environment variables set in the dashboard.",
  ],
  [
    "Previews and logs",
    "Every branch can deploy to its own address, and every request shows in the application's logs.",
  ],
];

export default function About() {
  return (
    <div className="page">
      <div className="page-head">
        <span className="kicker">About</span>
        <h1>A newsroom, made up.</h1>
        <p className="dek">
          Dispatch is a demo. The stories, writers and companies in it are invented. It exists to show what an
          application on swarza can do, with nothing but the platform underneath.
        </p>
      </div>
      <div className="facts">
        {features.map(([title, text]) => (
          <div key={title} className="fact">
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <p className="note-line">
        The source is in the swarza repository under <code>examples/news</code>. Questions go to the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </div>
  );
}
