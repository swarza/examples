/**
 * Hydrate 26, the made-up conference this example is dressed as. The program lives here; a real
 * site would read it from a CMS or a database. Plain data and helpers only, so the edge route
 * (app/api/now) can import it too.
 */

export const event = {
  name: "Hydrate",
  edition: "26",
  date: "2026-11-14",
  day: "Saturday 14 November 2026",
  city: "Kraków",
  venue: "The Depot",
  address: "Hall A, The Depot, Kraków",
  timeZone: "Europe/Warsaw",
};

export type Speaker = { name: string; role: string; bio: string };

export type Slot = {
  slug: string;
  start: string; // "HH:MM", venue time
  end: string;
  kind: "keynote" | "talk" | "lightning" | "break";
  title: string;
  speaker?: Speaker;
  abstract?: string[];
  questions?: string[];
  /** Announced after the site was built: no page is prerendered for it. */
  late?: boolean;
};

export const program: Slot[] = [
  { slug: "doors", start: "08:30", end: "09:30", kind: "break", title: "Doors open: badges and coffee" },
  {
    slug: "the-page-is-the-product",
    start: "09:30",
    end: "10:15",
    kind: "keynote",
    title: "The page is the product",
    speaker: {
      name: "Ada Kowal",
      role: "Front-end lead, Kestrel Radio",
      bio: "Ada runs the web team of a radio station whose listeners are mostly on old phones and train wifi. She has deleted more JavaScript than she has written.",
    },
    abstract: [
      "Most visitors see one page and leave. That page, as HTML, is the product: what arrives first, what can be read before anything runs, and what still works when a script fails.",
      "Ada walks through a year of moving a news-heavy site from a client-rendered app back to server-rendered pages, and what it did to bounce rates, support tickets and the team's weekends.",
    ],
    questions: [
      "How did you convince the product team to drop the client-side router?",
      "Which pages were hardest to move back to the server?",
      "Did search traffic change after the move?",
    ],
  },
  {
    slug: "caching-you-can-explain",
    start: "10:15",
    end: "11:00",
    kind: "talk",
    title: "Caching you can explain to your manager",
    speaker: {
      name: "Tomás Reyes",
      role: "Staff engineer, Larchmont Travel",
      bio: "Tomás looks after the pages that sell holidays. He once served last week's prices for six hours and has thought about cache invalidation ever since.",
    },
    abstract: [
      "Incremental regeneration, data cache tags and on-demand revalidation, explained with one timeline per request instead of a diagram with twenty arrows.",
      "You will leave with three questions to ask of any cached page: who can change it, how fast must the change show, and what happens to the visitor in between.",
    ],
    questions: [
      "What revalidate time do you start with for a new page?",
      "Do you tag by page or by the data it reads?",
      "How do you test that a revalidation actually happened?",
    ],
  },
  { slug: "coffee-morning", start: "11:00", end: "11:30", kind: "break", title: "Coffee" },
  {
    slug: "streaming-html",
    start: "11:30",
    end: "12:15",
    kind: "talk",
    title: "Streaming HTML, one Suspense boundary at a time",
    speaker: {
      name: "Priya Natarajan",
      role: "Independent consultant",
      bio: "Priya helps teams find out why their pages are slow, and usually finds a single request everyone is waiting for.",
    },
    abstract: [
      "A page does not have to wait for its slowest query. Send the shell at once and let each part arrive when it is ready.",
      "Priya shows where to put boundaries, what a good fallback looks like, and the two mistakes that make a streamed page feel slower than a blocking one.",
    ],
    questions: [
      "How many boundaries is too many?",
      "What happens to streamed parts when a crawler reads the page?",
      "Do you stream above the fold?",
    ],
  },
  {
    slug: "forms-without-a-library",
    start: "12:15",
    end: "13:00",
    kind: "talk",
    title: "Forms without a form library",
    speaker: {
      name: "Jonas Berg",
      role: "Developer, Fjord & Fern",
      bio: "Jonas builds booking systems for small hotels at a four-person agency in Malmö. His forms work without JavaScript because some of his clients' guests turn it off.",
    },
    abstract: [
      "A form element, a Server Action and a redirect cover most of what a booking flow needs. Jonas rebuilds a hotel's booking form live, then adds validation and pending states on top.",
      "Along the way: where to keep state between steps, and when a cookie is enough.",
    ],
    questions: [
      "How do you show errors next to the right field?",
      "Do Server Actions work with a CDN in front?",
      "What do you do about double submits?",
    ],
  },
  { slug: "lunch", start: "13:00", end: "14:00", kind: "break", title: "Lunch" },
  {
    slug: "images-are-most-of-your-page",
    start: "14:00",
    end: "14:45",
    kind: "talk",
    title: "Images are most of your page",
    speaker: {
      name: "Lena Duval",
      role: "Performance engineer, Oriel Shop",
      bio: "Lena measures the weight of an online furniture shop's pages for a living. Her record is a 14 MB hero image of a sofa.",
    },
    abstract: [
      "On most pages images are the bulk of the bytes. Sizes, formats, lazy loading and placeholders decide how fast a page feels more than anything in your bundle.",
      "Lena compares the same product page before and after, image by image.",
    ],
    questions: [
      "Is AVIF worth the extra encoding time?",
      "How do you stop editors uploading 14 MB images?",
      "Do blur placeholders hurt Largest Contentful Paint?",
    ],
  },
  {
    slug: "sqlite-closer-than-you-think",
    start: "14:45",
    end: "15:30",
    kind: "talk",
    title: "SQLite, closer than you think",
    speaker: {
      name: "Kofi Mensah",
      role: "Database engineer, Tallyhouse",
      bio: "Kofi runs the databases behind an accounting app. He likes boring technology and fast queries, in that order.",
    },
    abstract: [
      "When the database sits next to the app, a query costs about a millisecond and the N+1 problem stops being the first thing to worry about.",
      "Kofi shows real timings from a small app, and what changes in how you write queries when a round trip is cheap.",
    ],
    questions: [
      "What about writes from several regions?",
      "How do you run migrations without downtime?",
      "When would you not use SQLite?",
    ],
  },
  { slug: "coffee-afternoon", start: "15:30", end: "16:00", kind: "break", title: "Coffee" },
  {
    slug: "files-are-not-blobs",
    start: "16:00",
    end: "16:45",
    kind: "talk",
    title: "Files are not blobs",
    speaker: {
      name: "Mei Tanaka",
      role: "Platform engineer, Paperlane",
      bio: "Mei built the file uploads of a document-signing service twice. The second time was the good one.",
    },
    abstract: [
      "Uploads look simple until you have to decide who may read a file, for how long, and through which address.",
      "Mei covers buckets, signed links, public links and reading files through your app, with the trade-offs of each.",
    ],
    questions: [
      "How long should a signed link live?",
      "Do you scan uploads before storing them?",
      "Where do thumbnails get made?",
    ],
  },
  {
    slug: "cron-is-a-feature",
    start: "16:45",
    end: "17:30",
    kind: "talk",
    title: "Cron is a feature",
    speaker: {
      name: "Olek Nowicki",
      role: "Site reliability engineer, Bramble Energy",
      bio: "Olek keeps an energy supplier's billing running. Much of it is jobs that run at night and must not run twice.",
    },
    abstract: [
      "Reminder emails, clean-ups, reports: every app has work that should happen on a clock, not on a request.",
      "Olek goes through scheduled jobs that are safe to retry, easy to observe and boring to operate.",
    ],
    questions: [
      "How do you stop a job running twice?",
      "Where do you look when a job silently stopped?",
      "Is every five minutes too often?",
    ],
  },
  {
    slug: "lightning-talks",
    start: "17:30",
    end: "18:15",
    kind: "lightning",
    title: "Lightning talks",
    late: true,
    abstract: [
      "Five talks of five minutes each, picked from proposals sent in during the day. Anyone with a badge can propose one at the registration desk until 15:00.",
      "This talk was added after the site was built, so no page was prerendered for it: the first visit rendered this page, and later visits get the cached copy.",
    ],
    questions: ["Can I propose a talk remotely?", "Will the lightning talks be recorded?"],
  },
  { slug: "closing", start: "18:15", end: "20:00", kind: "break", title: "Closing words and drinks" },
];

export const talks = program.filter((s) => s.kind !== "break");
export const speakers = talks.flatMap((t) => (t.speaker ? [{ ...t.speaker, talk: t }] : []));

export const getTalk = (slug: string) => talks.find((t) => t.slug === slug);

export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

export const kindLabel: Record<Slot["kind"], string> = {
  keynote: "Keynote",
  talk: "Talk",
  lightning: "Lightning",
  break: "Break",
};

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** The venue's clock ("HH:MM:SS") at a moment. */
export function venueClock(at: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: event.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(at);
}

/** What is on at a moment, read on the venue's clock for any day: the slot, and the one after it. */
export function slotAt(at: Date): { now?: Slot; next?: Slot } {
  const t = minutes(venueClock(at));
  const now = program.find((s) => minutes(s.start) <= t && t < minutes(s.end));
  const next = program.find((s) => minutes(s.start) > t);
  return { now, next };
}

/** "30 Sep, 14:02:11 CEST": a moment on the venue's clock, for "published at" lines. */
export function stamp(at: Date | number) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: event.timeZone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(at);
}
