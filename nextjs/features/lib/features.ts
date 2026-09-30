/**
 * Which Next.js feature and which swarza feature each part of the site shows, and where the code
 * is. Every page ends with its entry ("How this page works"); /under-the-hood lists them all.
 *
 * `hints` are the pulsing dots next to the elements on the pages (components/FeatureHint.tsx): what
 * the element uses, and how to see it for yourself. In a step, `backticks` are code; a code path
 * that starts with / is a link, and {origin} is replaced with this site's address.
 */
/** Where the header's "Show features" choice is kept; app/layout.tsx reads it before the page paints. */
export const HINTS_KEY = "hydrate:hints";

export type Feature = {
  id: string;
  label: string;
  path: string;
  href?: string;
  next: string;
  swarza: string;
  code: string[];
};

export type Hint = {
  id: string;
  /** The Feature it belongs to: the anchor on /under-the-hood. */
  page: string;
  title: string;
  next: string;
  swarza: string;
  test: string[];
};

export const features: Feature[] = [
  {
    id: "home",
    label: "Home",
    path: "/",
    href: "/",
    next: "A static page, prerendered by next build. No code runs when it is requested.",
    swarza: "Served from the prerender cache and the CDN.",
    code: ["app/page.tsx"],
  },
  {
    id: "schedule",
    label: "Schedule",
    path: "/schedule",
    href: "/schedule",
    next: "Incremental Static Regeneration (revalidate = 30) over a data cache entry tagged program. POST /api/revalidate drops the tag and the page on demand.",
    swarza:
      "The cached page is served while a fresh one renders in the background; the new copy replaces it for everyone.",
    code: ["app/schedule/page.tsx", "lib/schedule.ts", "app/api/revalidate/route.ts"],
  },
  {
    id: "talks",
    label: "Talk pages",
    path: "/talks/[slug]",
    href: "/talks/caching-you-can-explain",
    next: "generateStaticParams prerenders a page per talk. A talk added after the build (the lightning talks) renders on its first request, then stays cached.",
    swarza: "Pages rendered on demand go into the same prerender cache as the ones from the build.",
    code: ["app/talks/[slug]/page.tsx", "lib/program.ts"],
  },
  {
    id: "now",
    label: "Live board",
    path: "/now",
    href: "/now",
    next: "Rendered on every request with headers() and cookies(). The questions and the latest signatures stream in later, each in its own Suspense boundary.",
    swarza:
      "Your application renders each request. The CDN adds the visitor's country, which proxy.ts passes on.",
    code: ["app/now/page.tsx", "proxy.ts"],
  },
  {
    id: "agenda",
    label: "My agenda",
    path: "/agenda",
    href: "/agenda",
    next: "Server Actions that save your picks in a cookie, then revalidatePath('/agenda').",
    swarza: "Actions are POST requests to your application; no API route to write.",
    code: ["app/agenda/page.tsx", "app/agenda/actions.ts"],
  },
  {
    id: "venue",
    label: "Venue",
    path: "/venue",
    href: "/venue",
    next: "next/image with a blur placeholder and responsive sizes.",
    swarza: "Image optimisation: resized and converted to AVIF or WebP on first request, then cached.",
    code: ["app/venue/page.tsx"],
  },
  {
    id: "wall",
    label: "Attendee wall",
    path: "/guestbook",
    href: "/guestbook",
    next: "A Server Action with revalidatePath; the page is rendered per request (force-dynamic).",
    swarza: "A swarza database (libSQL, SQLite compatible), bound as DATABASE and read with Drizzle.",
    code: ["app/guestbook/page.tsx", "lib/db.ts", "lib/schema.ts", "drizzle/"],
  },
  {
    id: "photos",
    label: "Photos",
    path: "/uploads",
    href: "/uploads",
    next: "A route handler takes the multipart upload; a catch-all route streams files back from the bucket.",
    swarza:
      "A Storage bucket with the S3 API, bound as STORAGE: upload, list, signed links, and public links when the bucket is public.",
    code: [
      "app/uploads/page.tsx",
      "app/api/uploads/route.ts",
      "app/uploads/file/[...key]/route.ts",
      "lib/storage.ts",
    ],
  },
  {
    id: "api",
    label: "JSON API",
    path: "/api/schedule, /api/now",
    href: "/api/schedule",
    next: "Route handlers on the Node.js runtime (/api/schedule) and the edge runtime (/api/now). /schedule.json is a rewrite to /api/schedule.",
    swarza:
      "Both run in your application; the headers rule in next.config.mjs adds x-example to every /api response.",
    code: ["app/api/schedule/route.ts", "app/api/now/route.ts", "next.config.mjs"],
  },
  {
    id: "routing",
    label: "Redirects and proxy",
    path: "proxy.ts, next.config.mjs",
    next: "proxy.ts redirects /live to /now, passes the country on and counts your visits to the live board. next.config.mjs redirects /program and /rsvp.",
    swarza: "The proxy and the config rules run as they do under next start.",
    code: ["proxy.ts", "next.config.mjs"],
  },
  {
    id: "jobs",
    label: "Scheduled job",
    path: "jobs/heartbeat.ts",
    next: "A plain function; no route, no URL.",
    swarza:
      "A scheduled job from swarza.json, every 5 minutes. It logs how many people signed the wall; see the application's Logs tab.",
    code: ["jobs/heartbeat.ts", "swarza.json"],
  },
  {
    id: "timings",
    label: "Live timings",
    path: "/under-the-hood, /api/db, /api/storage",
    href: "/under-the-hood#database",
    next: "Rendered per request (force-dynamic). Each set of timings streams in its own Suspense boundary.",
    swarza: "The database and the bucket bound to this application, called from inside it.",
    code: ["app/under-the-hood/page.tsx", "lib/timing.ts", "lib/storage-timing.ts"],
  },
];

export const hints = {
  static: {
    page: "home",
    title: "Static page",
    next: "This page has nothing that changes per visitor, so next build rendered it once. The time here is when that happened.",
    swarza: "Served as a file from the prerender cache and the CDN. No code runs for it.",
    test: [
      "Note the time next to this dot.",
      "Reload, or open the page on another device: the same time, until the next deploy.",
    ],
  },
  redirects: {
    page: "routing",
    title: "Redirects in next.config.mjs",
    next: "The link goes to /rsvp, the address printed on the posters. A redirect rule in next.config.mjs sends it to the attendee wall; /program goes to the schedule.",
    swarza: "The rules come with your build. There is nothing to set up.",
    test: [
      "Open `/rsvp`: you land on /guestbook.",
      "Run `curl -I {origin}/program`: a 308 with Location: /schedule.",
    ],
  },
  image: {
    page: "venue",
    title: "next/image",
    next: "The photo goes through next/image: resized for your screen, with a tiny blurred copy in the HTML that shows while it loads.",
    swarza: "swarza's image optimisation makes each size as AVIF or WebP on the first request and caches it.",
    test: [
      "Open DevTools, Network, filter Img, and reload: the photo comes from `/_next/image?url=…&w=…` as avif or webp.",
      "Make the window narrower and reload: a smaller w is asked for.",
      "Throttle the network to Slow 4G and reload: the blur shows first.",
    ],
  },
  isr: {
    page: "schedule",
    title: "Incremental Static Regeneration",
    next: "The schedule is a cached page with revalidate = 30. After 30 seconds the next visit still gets this copy and starts a fresh render in the background.",
    swarza: "The cached copy is served from the prerender cache; the new one replaces it for everyone.",
    test: [
      "Note the “This copy generated” time.",
      "Reload within 30 seconds: the same time.",
      "Wait 30 seconds and reload: still the old time, while a new copy renders.",
      "Reload once more: the new time.",
    ],
  },
  revalidate: {
    page: "schedule",
    title: "On-demand revalidation",
    next: "The program is read through the data cache with the tag program. POST /api/revalidate calls revalidateTag and revalidatePath, as if the organisers published a change.",
    swarza: "Dropping the tag clears the cached data and pages for every instance of your application.",
    test: [
      "Run `curl -X POST {origin}/api/revalidate`.",
      "Reload this page twice: the “Published” time is now.",
    ],
  },
  "static-params": {
    page: "talks",
    title: "generateStaticParams",
    next: "generateStaticParams listed this talk, so next build made its page ahead of time. It regenerates at most once an hour.",
    swarza: "Served from the prerender cache, like the other pages from the build.",
    test: [
      "Note the “rendered” time: it is when the site was built.",
      "Open `/talks/lightning-talks`: it was not built ahead, so the first request renders it and its time is later.",
    ],
  },
  "on-demand": {
    page: "talks",
    title: "Rendered on first request",
    next: "The lightning talks were announced after the build, so generateStaticParams left them out. The first request renders the page, and it is cached from then on.",
    swarza: "Pages rendered on demand go into the same cache as the pages from the build.",
    test: [
      "Open `/talks/lightning-talks` and note the “rendered” time.",
      "Reload: the same time, now from the cache.",
      "Compare with `/talks/streaming-html`: it was rendered at build time.",
    ],
  },
  "agenda-add": {
    page: "agenda",
    title: "Server Action with redirect",
    next: "The button submits a form to a Server Action. It saves the talk in a cookie and redirects you to your agenda.",
    swarza: "An action is a POST to your application. There is no API route to write.",
    test: [
      "Press “Add to my agenda”: you land on /agenda with the talk saved.",
      "Turn JavaScript off and try another talk: it still works, as a plain form post.",
    ],
  },
  actions: {
    page: "agenda",
    title: "Server Actions",
    next: "Each Add button is a form that calls a Server Action. It saves your picks in a cookie and calls revalidatePath, so the page comes back updated in the same response.",
    swarza: "An action is a POST to your application. There is no API route to write.",
    test: [
      "Press Add on a talk: the list updates without a full page load.",
      "Turn JavaScript off and press another: it still works.",
      "Open this page in another browser: nothing saved there. The picks live in this browser's cookie.",
    ],
  },
  dynamic: {
    page: "now",
    title: "Rendered per request",
    next: "The live board reads headers() and cookies(), so Next.js renders it for every request. Nothing here is cached.",
    swarza: "Your application renders each request. proxy.ts counts your visits in a cookie first.",
    test: [
      "Reload: the “Rendered” time changes and your visit number goes up.",
      "Open this page in a private window: you are a first-time visitor again.",
    ],
  },
  geo: {
    page: "now",
    title: "Country from the CDN",
    next: "proxy.ts copies the CDN's country header into x-country, and the page reads it with headers().",
    swarza: "The CDN in front of swarza adds cloudfront-viewer-country to every request.",
    test: [
      "Turn on a VPN in another country and reload: the country changes.",
      "Under next start on your laptop there is no CDN, so it says unknown.",
    ],
  },
  streaming: {
    page: "now",
    title: "Streaming with Suspense",
    next: "The questions wait 1.2 seconds on purpose, inside a Suspense boundary. The rest of the page is sent first; the questions follow in the same response.",
    swarza: "Your application streams the HTML as it renders, and swarza passes it on without buffering.",
    test: [
      "Reload and watch this section: “Collecting questions…” first, the questions a moment later.",
      "Run `curl -N {origin}/now` and watch the HTML arrive in two parts.",
    ],
  },
  proxy: {
    page: "routing",
    title: "proxy.ts",
    next: "proxy.ts runs before every page. For /live, the short link on the badges, it answers with a redirect to this board.",
    swarza: "The proxy runs in your application, as under next start.",
    test: ["Open `/live`: you land here.", "Run `curl -I {origin}/live`: a 307 with Location: /now."],
  },
  "db-read": {
    page: "wall",
    title: "Database read with Drizzle",
    next: "The wall is rendered for every request (force-dynamic). It reads the latest 24 signatures and the count with Drizzle, and times the two queries.",
    swarza: "A swarza database (libSQL, SQLite compatible), bound to the application as DATABASE.",
    test: [
      "Reload: the “Read in” time is measured again.",
      "Run `curl {origin}/api/db` for more timings as JSON.",
    ],
  },
  wall: {
    page: "wall",
    title: "Server Action to the database",
    next: "The form calls a Server Action that inserts a row with Drizzle, then calls revalidatePath so you see your entry at once.",
    swarza: "The row goes to the bound database, so every visitor sees it.",
    test: [
      "Sign the wall.",
      "Open this page in another browser or on your phone: your entry is there.",
      "Open `/now`: the latest names show there too.",
    ],
  },
  jobs: {
    page: "jobs",
    title: "Scheduled job",
    next: "Nothing on the Next.js side: jobs/heartbeat.ts is a plain function with no route and no URL.",
    swarza:
      "swarza.json lists it as a scheduled job every 5 minutes. It runs with the same database binding as the site.",
    test: [
      "Sign the wall.",
      "After the next five-minute mark, open the application's Logs tab in the swarza dashboard: the heartbeat line has the new count.",
    ],
  },
  storage: {
    page: "photos",
    title: "Route handlers and a bucket",
    next: "The form posts to a route handler that stores the file. A catch-all route, /uploads/file/[...key], streams files back through the app.",
    swarza:
      "A swarza Storage bucket with the S3 API, bound as STORAGE. Signed links go straight to the bucket.",
    test: [
      "Upload a photo: you come back with how long storing it took.",
      "Open “Through the app”: the app reads it from the bucket.",
      "Open “Signed link, 10 min” again after ten minutes: it has expired.",
    ],
  },
  "route-node": {
    page: "api",
    title: "Route handler, Node.js",
    next: "GET /api/schedule is a route handler that returns the program as JSON. /schedule.json is a rewrite to it, and a headers rule adds x-example to every /api response.",
    swarza: "It runs in your application and reads the same cached program as the schedule page.",
    test: [
      "Run `curl {origin}/schedule.json`.",
      "Run `curl -I {origin}/api/schedule` and look for x-example: swarza.",
    ],
  },
  edge: {
    page: "api",
    title: "Route handler, edge runtime",
    next: "GET /api/now sets runtime = 'edge': it uses only Web APIs, no Node.js. It says what is on stage right now.",
    swarza: "It runs in your application too. There is nothing else to set up.",
    test: ["Run `curl {origin}/api/now`: the answer has “runtime”: “edge”."],
  },
  timings: {
    page: "timings",
    title: "Measured live",
    next: "This page renders per request, and each set of timings streams in its own Suspense boundary while the rest of the page is already shown.",
    swarza: "The calls go from inside the application to its bound database and bucket.",
    test: [
      "Reload: everything is measured again.",
      "Run `curl {origin}/api/db?n=50` or `curl {origin}/api/storage` for the JSON.",
    ],
  },
} satisfies Record<string, Omit<Hint, "id">>;

export type HintId = keyof typeof hints;

export const hint = (id: HintId): Hint => ({ id, ...hints[id] });
export const feature = (id: string) => features.find((f) => f.id === id)!;
/** The hints that belong to a feature, for its row on /under-the-hood. */
export const hintsFor = (page: string) =>
  (Object.keys(hints) as HintId[]).map(hint).filter((h) => h.page === page);
