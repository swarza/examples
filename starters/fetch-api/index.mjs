/**
 * A fetch app: swarza calls `fetch` for every request, in Node.js 24. It answers with HTML pages,
 * JSON and files, all from here. Variables from the dashboard's Environment tab are in `env` (and in
 * `process.env`).
 */
import { readFileSync } from "node:fs";
import { currency, hours, menu, settings } from "./data.mjs";
import { openStatus, statusText } from "./clock.mjs";
import { homePage, menuPage, notFoundPage, subscribePage, thanksPage } from "./pages.mjs";

// Files next to this module are read once, when a worker starts. The upload is read-only.
const file = (name) => readFileSync(new URL(`./assets/${name}`, import.meta.url));
const assets = {
  "/styles.css": { body: file("styles.css"), type: "text/css; charset=utf-8" },
  "/favicon.svg": { body: file("favicon.svg"), type: "image/svg+xml" },
  "/dither.png": { body: file("dither.png"), type: "image/png" },
};

// Cache-Control: pages that show the time are never cached; the menu may be, for a few minutes.
const NO_STORE = "no-store";
const FIVE_MINUTES = "public, max-age=300";
const ONE_DAY = "public, max-age=86400";

const page = (body, { status = 200, cache = NO_STORE } = {}) =>
  new Response(String(body), {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": cache },
  });

const json = (data, { status = 200, cache = NO_STORE } = {}) =>
  Response.json(data, { status, headers: { "cache-control": cache } });

/** Routes by method and path. Each gets `{ request, shop, ctx }`. */
const routes = {
  "GET /": ({ request, shop }) =>
    page(
      homePage({
        shop,
        status: openStatus(shop.timeZone),
        // The visitor's IP; swarza puts it first in X-Forwarded-For.
        visitor: { ip: request.headers.get("x-forwarded-for")?.split(",")[0].trim() },
      }),
    ),

  "GET /menu": ({ shop }) => page(menuPage({ shop }), { cache: FIVE_MINUTES }),

  "GET /subscribe": ({ shop }) => page(subscribePage({ shop }), { cache: FIVE_MINUTES }),

  "POST /subscribe": subscribe,

  "GET /api": () =>
    json(
      {
        endpoints: {
          "GET /api/menu": "The menu, in sections",
          "GET /api/hours": "Opening hours and whether the shop is open now",
          "POST /subscribe": "Sign up for the newsletter: email, name (send Accept: application/json)",
        },
      },
      { cache: ONE_DAY },
    ),

  "GET /api/menu": () => json({ currency, sections: menu }, { cache: FIVE_MINUTES }),

  "GET /api/hours": ({ shop }) => {
    const { now, ...status } = openStatus(shop.timeZone);
    return json({
      timeZone: shop.timeZone,
      localTime: now.time,
      ...status,
      summary: statusText({ now, ...status }),
      week: hours.map(({ day, open, close = null }) => ({ day, open, close })),
    });
  },
};

/** The newsletter form. Answers with a page, or with JSON when the client asks for it. */
async function subscribe({ request, shop, ctx }) {
  const wantsJson = request.headers.get("accept")?.includes("application/json");
  const input = request.headers.get("content-type")?.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData().catch(() => new FormData()));

  const values = { name: String(input.name ?? "").trim(), email: String(input.email ?? "").trim() };
  const errors = {};
  if (!values.email) errors.email = "Enter your email address.";
  else if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "That does not look like an email address.";
  if (values.name.length > 60) errors.name = "Keep it under 60 characters.";

  if (Object.keys(errors).length) {
    return wantsJson
      ? json({ ok: false, errors }, { status: 422 })
      : page(subscribePage({ shop, values, errors }), { status: 422 });
  }

  // Work that should not hold up the answer: it runs after the response is sent.
  ctx.waitUntil(recordSignup(values, shop));

  return wantsJson
    ? json({ ok: true, email: values.email, message: "Thanks, you are on the list." }, { status: 201 })
    : page(thanksPage({ shop, signup: values }));
}

/** Logs the sign-up (see the Logs tab) and, if SIGNUP_WEBHOOK_URL is set, posts it there. */
async function recordSignup(signup, shop) {
  const [user, domain] = signup.email.split("@");
  console.log(`newsletter sign-up: ${user.slice(0, 1)}***@${domain}`);
  if (!shop.webhook) return;
  const res = await fetch(shop.webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: `New ${shop.shopName} newsletter sign-up: ${signup.email}` }),
  }).catch((error) => ({ ok: false, status: error.message }));
  if (!res.ok) console.warn(`SIGNUP_WEBHOOK_URL answered ${res.status}`);
}

function decodePath(path) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path; // not valid percent-encoding: show it as it came
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method === "HEAD" ? "GET" : request.method;
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : "/";
    const shop = settings(env);

    const asset = assets[path];
    if (asset && method === "GET") {
      return new Response(asset.body, { headers: { "content-type": asset.type, "cache-control": ONE_DAY } });
    }

    const route = routes[`${method} ${path}`];
    if (route) return route({ request, shop, ctx });

    // A known path with another method: 405, and which methods it takes.
    const allowed = Object.keys(routes)
      .filter((key) => key.endsWith(` ${path}`))
      .map((key) => key.split(" ")[0]);
    if (allowed.length) {
      return new Response("Method not allowed", { status: 405, headers: { allow: allowed.join(", ") } });
    }

    if (path.startsWith("/api/")) return json({ error: "Not found" }, { status: 404 });
    // The path is shown as typed (decoded); pages.mjs escapes it, so /<script> stays text.
    return page(notFoundPage({ shop, path: decodePath(path) }), { status: 404 });
  },
};
