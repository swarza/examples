/**
 * Which Next.js feature and which swarza feature each part of the site shows, and where the code
 * is. Every page ends with its entry ("How this page works"); /under-the-hood lists them all.
 */
export type Feature = {
  id: string;
  label: string;
  path: string;
  href?: string;
  next: string;
  swarza: string;
  code: string[];
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
];

export const feature = (id: string) => features.find((f) => f.id === id)!;
