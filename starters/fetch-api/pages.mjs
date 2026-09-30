/**
 * The HTML pages, as template literals. `html` escapes every value it is given, so a name typed
 * into the form can never become markup; only other `html` results are inserted as they are.
 */
import { featured, formatPrice, hours, menu } from "./data.mjs";
import { feature, features } from "./features.mjs";

class Html {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);
const render = (value) => {
  if (value instanceof Html) return value.value;
  if (Array.isArray(value)) return value.map(render).join("");
  if (value == null || value === false) return "";
  return escape(value);
};

export function html(strings, ...values) {
  return new Html(strings.reduce((out, s, i) => out + render(values[i - 1]) + s));
}

/** Plain text where `backticks` become <code>. Everything is still escaped. */
const rich = (text) => text.split("`").map((part, i) => (i % 2 ? html`<code>${part}</code>` : part));

const FONTS =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap";

const NAV = [
  ["/", "Today"],
  ["/menu", "Menu"],
  ["/subscribe", "Newsletter"],
  ["/how-it-works", "How it works"],
  ["/api", "JSON API"],
];

// Runs before the first paint, so bubbles someone switched off never flash in.
const FEATURES_PREF = `try{if(localStorage.getItem("halftone-features")==="off")document.documentElement.dataset.features="off"}catch(e){}`;

/**
 * A feature bubble. Without JavaScript it is a <details> that opens as a sheet at the bottom of
 * the screen; hints.js turns it into a button with a popover. The texts live in features.mjs.
 */
function hint(id, origin) {
  const f = feature(id);
  return html`
    <details class="hint">
      <summary class="hint-btn" aria-label="How it works: ${f.title}">
        <span aria-hidden="true">?</span>
      </summary>
      <div class="hint-pop" id="hint-${id}">
        <p class="hint-title">${f.title}</p>
        <p>${rich(f.what)}</p>
        <p class="hint-label">Try it</p>
        ${steps(f, origin)}
        <a class="hint-more" href="/how-it-works#${id}">All features</a>
      </div>
    </details>
  `;
}

const steps = (f, origin) => html`
  <ol class="steps">
    ${f
      .steps(origin)
      .map(
        (step) => html`
          <li>
            ${rich(step.text)} ${step.code ? html`<pre class="code"><code>${step.code}</code></pre>` : ""}
          </li>
        `,
      )}
  </ol>
`;

/** The frame around every page: head, header with navigation, and footer. */
function layout({ shop, title, path, body, brandHint = "" }) {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title ? `${title} · ${shop.shopName}` : shop.shopName}</title>
        <meta
          name="description"
          content="${shop.shopName}: a small coffee roaster and café. A swarza fetch app demo."
        />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0b0b0b" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="${FONTS}" />
        <link rel="stylesheet" href="/styles.css" />
        <script>
          ${new Html(FEATURES_PREF)};
        </script>
        <script src="/hints.js" defer></script>
      </head>
      <body>
        <header class="top">
          <div class="wrap top-row">
            <div class="brand-row">
              <a class="brand" href="/">
                <img src="/favicon.svg" alt="" width="20" height="20" />
                <span>${shop.shopName}</span>
              </a>
              ${brandHint}
            </div>
            <nav class="nav" aria-label="Main">
              ${NAV.map(
                ([href, label]) =>
                  html`<a href="${href}" ${href === path ? html`aria-current="page"` : ""}>${label}</a>`,
              )}
            </nav>
          </div>
        </header>
        <main>${body}</main>
        <footer class="wrap">
          <div class="foot">
            <div>
              <p class="foot-name">${shop.shopName}</p>
              <p class="muted">Roastery and café, ${shop.address}.<br />Closed on Mondays, when we roast.</p>
            </div>
            <div>
              <p class="label">About this demo</p>
              <p class="muted">
                A
                <a href="https://github.com/swarza/examples/tree/main/starters/fetch-api"
                  >fetch app on swarza</a
                >: one <code>fetch</code> handler serves these pages, the JSON API and the files. The small
                <span class="q" aria-hidden="true">?</span> marks show what the server does at that spot;
                <a href="/how-it-works">How it works</a> lists them all.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html> `;
}

/** The sign: an ink dot (filled when open), and when that changes. */
function statusSign(status) {
  const detail = status.open
    ? status.closingSoon
      ? `closing soon, at ${status.closes}`
      : `until ${status.closes} today`
    : status.opens
      ? `opens ${status.opens.day} at ${status.opens.time}`
      : "";
  return html`
    <p class="status ${status.open ? "is-open" : "is-closed"}">
      <span class="dot" aria-hidden="true"></span>
      <span class="status-word">${status.open ? "Open now" : "Closed"}</span>
      ${detail ? html`<span class="status-detail">${detail}</span>` : ""}
    </p>
  `;
}

const price = (item) => html`<span class="price">${formatPrice(item.price)}</span>`;

/** Tasting notes as one short line: "Blackcurrant, grapefruit, cane sugar". */
const notes = (item) =>
  item.notes?.length
    ? html`<p class="notes">
        <span class="visually-hidden">Tasting notes: </span>${item.notes
          .map((note, i) => (i ? note.toLowerCase() : note))
          .join(", ")}
      </p>`
    : "";

function hoursTable(status) {
  return html`
    <table class="hours">
      <caption class="visually-hidden">
        Opening hours
      </caption>
      <tbody>
        ${hours.map(
          (h, i) => html`
            <tr ${i === status.now.day ? html`class="today" aria-current="date"` : ""}>
              <th scope="row">
                ${h.day}${i === status.now.day ? html` <span class="today-tag">Today</span>` : ""}
              </th>
              <td>
                ${h.open ? `${h.open}–${h.close}` : `Closed${h.note ? `, ${h.note.toLowerCase()}` : ""}`}
              </td>
            </tr>
          `,
        )}
      </tbody>
    </table>
  `;
}

function signupForm({ values = {}, errors = {} } = {}) {
  const field = (name, label, type, extra) => html`
    <label class="field" for="${name}">
      <span class="label">${label}</span>
      <input
        id="${name}"
        name="${name}"
        type="${type}"
        value="${values[name] ?? ""}"
        ${extra}
        ${errors[name] ? html`aria-invalid="true" aria-describedby="${name}-error"` : ""}
      />
      ${errors[name] ? html`<span class="error" id="${name}-error">${errors[name]}</span>` : ""}
    </label>
  `;
  return html`
    <form class="form" method="post" action="/subscribe">
      ${field("name", "First name (optional)", "text", html`autocomplete="given-name" maxlength="60"`)}
      ${field("email", "Email", "email", html`autocomplete="email" required maxlength="254"`)}
      <button class="btn" type="submit">Sign up</button>
    </form>
  `;
}

export function homePage({ shop, status, visitor, origin }) {
  const sectionOf = (item) => menu.find((s) => s.items.includes(item)).title;
  const body = html`
    <section class="hero">
      <img class="hero-art" src="/dither.png" alt="" width="1920" height="480" />
      <div class="wrap hero-text">
        <div class="row">${statusSign(status)} ${hint("open-now", origin)}</div>
        <h1 class="display">Roasted on Monday, poured all week.</h1>
        <div class="row">
          <p class="meta">${status.now.date}, ${status.now.time}</p>
          ${hint("no-store", origin)}
        </div>
        <p class="actions">
          <a class="btn" href="/menu">See the menu</a>
          <a href="#hours">Opening hours</a>
        </p>
      </div>
      <div class="art-hint">${hint("static-files", origin)}</div>
    </section>

    <div class="wrap stack">
      <section>
        <div class="section-head">
          <h2>On the bar this week</h2>
          ${hint("api-json", origin)}
          <a class="more" href="/menu">Full menu</a>
        </div>
        <div class="cards">
          ${featured.map(
            (item) => html`
              <article class="card">
                <p class="card-section">${sectionOf(item)}</p>
                <h3 class="card-title">${item.name}</h3>
                <p class="muted">${item.description}</p>
                ${notes(item)} ${price(item)}
              </article>
            `,
          )}
        </div>
      </section>

      <div class="split">
        <section id="hours">
          <div class="section-head">
            <h2>Opening hours</h2>
            ${hint("scheduled-job", origin)}
            <span class="more muted">${shop.timeZone}</span>
          </div>
          ${hoursTable(status)}
          <p class="muted small">It is ${status.now.time} in ${shop.timeZone}.</p>
        </section>
        <section id="letter">
          <div class="section-head">
            <h2>The roast letter</h2>
            ${hint("form-post", origin)}
          </div>
          <p class="lead">One short email when a new coffee lands, about once a month.</p>
          ${signupForm()}
        </section>
      </div>

      <section>
        <div class="section-head"><h2>How this page is made</h2></div>
        <div class="split">
          <div class="prose">
            <p>
              One <code>fetch(request, env, ctx)</code> function in <code>index.mjs</code> serves everything
              here: the pages, the form, a JSON API, the stylesheet and the pictures. No framework, no build
              step, no dependencies.
            </p>
            <div class="row">
              <p class="muted">
                Made for <span class="ip">${visitor.ip ?? "an unknown address"}</span> at ${status.now.time},
                just now.
              </p>
              ${hint("visitor-ip", origin)}
            </div>
            <p><a href="/how-it-works">See every feature</a></p>
          </div>
          <ul class="routes">
            <li>
              <a href="/menu"><code>GET /menu</code></a
              ><span>the menu, cached 5 minutes</span>
            </li>
            <li>
              <a href="/api/menu"><code>GET /api/menu</code></a
              ><span>the same menu as JSON</span>
            </li>
            <li>
              <a href="/api/hours"><code>GET /api/hours</code></a
              ><span>hours and open now</span>
            </li>
            <li>
              <a href="/subscribe"><code>POST /subscribe</code></a
              ><span>the form, as HTML or JSON</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  `;
  return layout({ shop, title: null, path: "/", body, brandHint: hint("shop-name", origin) });
}

export function menuPage({ shop, origin }) {
  const body = html`
    <div class="wrap stack page">
      <header class="page-head">
        <div class="row">
          <h1 class="display">What we pour</h1>
          ${hint("menu-cache", origin)}
        </div>
        <div class="row">
          <p class="dek">
            Prices include VAT. The same list is at <a href="/api/menu">/api/menu</a> as JSON.
          </p>
          ${hint("api-json", origin)}
        </div>
        <nav class="jump" aria-label="Menu sections">
          ${menu.map((s) => html`<a href="#${s.id}">${s.title}</a>`)}
        </nav>
      </header>
      <div class="menu">
        ${menu.map(
          (section) => html`
            <section class="menu-section" id="${section.id}">
              <h2 class="h2">${section.title}</h2>
              <p class="muted small">${section.note}</p>
              <ul class="items">
                ${section.items.map(
                  (item) => html`
                    <li>
                      <div>
                        <p class="item-name">${item.name}</p>
                        <p class="muted small">${item.description}</p>
                        ${notes(item)}
                      </div>
                      ${price(item)}
                    </li>
                  `,
                )}
              </ul>
            </section>
          `,
        )}
      </div>
    </div>
  `;
  return layout({ shop, title: "Menu", path: "/menu", body });
}

export function subscribePage({ shop, values, errors, origin }) {
  const body = html`
    <div class="wrap stack page">
      <div class="split">
        <header class="page-head">
          <h1 class="display">The roast letter</h1>
          <p class="dek">
            One short email when a new coffee lands, about once a month: where it is from, how it tastes and
            how we brew it. Nothing else.
          </p>
          <div class="row">
            <p class="muted small">We log each sign-up after we answer, and can pass it to a webhook.</p>
            ${hint("wait-until", origin)}
          </div>
        </header>
        <section class="form-panel">
          <div class="section-head">
            <h2>Sign up</h2>
            ${hint("form-post", origin)}
          </div>
          ${errors ? html`<p class="alert" role="alert">Please check the form.</p>` : ""}
          ${signupForm({ values, errors })}
        </section>
      </div>
    </div>
  `;
  return layout({ shop, title: "Newsletter", path: "/subscribe", body });
}

export function thanksPage({ shop, signup, origin }) {
  const body = html`
    <div class="wrap stack page">
      <header class="page-head">
        <p class="label">You are on the list</p>
        <h1 class="display">Thanks${signup.name ? `, ${signup.name}` : ""}.</h1>
        <p class="dek">We will write to ${signup.email} when the next coffee lands.</p>
        <div class="row">
          <p class="muted small">
            This demo keeps nothing. It logs the sign-up after answering, with <code>ctx.waitUntil</code>, so
            you can see it on the Logs tab. A real shop would save it in a database.
          </p>
          ${hint("wait-until", origin)}
        </div>
        <p class="actions"><a class="btn" href="/">Back to today</a><a href="/menu">See the menu</a></p>
      </header>
    </div>
  `;
  return layout({ shop, title: "Thanks", path: null, body });
}

export function howItWorksPage({ shop, origin }) {
  const body = html`
    <div class="wrap stack page">
      <header class="page-head">
        <h1 class="display">How it works</h1>
        <p class="dek">
          Every <span class="q" aria-hidden="true">?</span> on this site, in one list: what the server does at
          that spot, and how to see it for yourself. The commands use this site's address, so you can paste
          them as they are.
        </p>
      </header>
      <ol class="features">
        ${features.map(
          (f, i) => html`
            <li class="feature" id="${f.id}">
              <p class="feature-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</p>
              <div class="feature-body">
                <h2 class="h2">${f.title}</h2>
                <p>${rich(f.what)}</p>
                <p class="hint-label">Try it</p>
                ${steps(f, origin)}
                <p class="feature-on">
                  <span class="muted">On</span>
                  ${f.on.map(([href, label]) => html`<a href="${href}">${label}</a>`)}
                </p>
              </div>
            </li>
          `,
        )}
      </ol>
    </div>
  `;
  return layout({ shop, title: "How it works", path: "/how-it-works", body });
}

export function notFoundPage({ shop, path, origin }) {
  const body = html`
    <div class="wrap stack page">
      <header class="page-head">
        <div class="row">
          <p class="label">404</p>
          ${hint("not-found", origin)}
        </div>
        <h1 class="display">Nothing on this shelf</h1>
        <p class="dek">There is no page at <code class="path">${path}</code>.</p>
        <p class="actions"><a class="btn" href="/">Back to today</a><a href="/menu">See the menu</a></p>
      </header>
    </div>
  `;
  return layout({ shop, title: "Not found", path: null, body });
}
