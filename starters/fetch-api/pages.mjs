/**
 * The HTML pages, as template literals. `html` escapes every value it is given, so a name typed
 * into the form can never become markup; only other `html` results are inserted as they are.
 */
import { featured, formatPrice, hours, menu } from "./data.mjs";
import { statusText } from "./clock.mjs";

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

const FONTS =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;1,400&display=swap";

const NAV = [
  ["/", "Today"],
  ["/menu", "Menu"],
  ["/subscribe", "Newsletter"],
  ["/api", "JSON API"],
];

/** The frame around every page: head, masthead, navigation and footer. */
function layout({ shop, title, path, body }) {
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="${FONTS}" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header class="wrap">
          <div class="mast">
            <a class="logo" href="/">${shop.shopName}</a>
            <p class="mast-meta">Roastery and café<br />${shop.address}</p>
          </div>
          <nav class="nav" aria-label="Main">
            ${NAV.map(
              ([href, label]) =>
                html`<a href="${href}" ${href === path ? html`aria-current="page"` : ""}>${label}</a>`,
            )}
          </nav>
        </header>
        <main>${body}</main>
        <footer class="wrap">
          <div class="footer">
            <div>
              <p class="footer-name">${shop.shopName}</p>
              <p class="muted">${shop.address}. Closed on Mondays, when we roast.</p>
            </div>
            <div>
              <p class="kicker">About this demo</p>
              <p class="muted">
                A
                <a href="https://github.com/swarza/examples/tree/main/starters/fetch-api"
                  >fetch app on swarza</a
                >: one <code>fetch</code> handler serves these pages, the JSON API and the files. The name and
                the time zone come from the <code>SHOP_NAME</code> and <code>TIME_ZONE</code> variables, now
                “${shop.shopName}” and ${shop.timeZone}.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html> `;
}

const statusLine = (status) => html`
  <p class="status ${status.open ? "is-open" : "is-closed"}">
    <span class="dot" aria-hidden="true"></span>${statusText(status)}
  </p>
`;

const price = (item) => html`<span class="price">${formatPrice(item.price)}</span>`;

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
              <th scope="row">${h.day}</th>
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
      <button type="submit">Sign up</button>
    </form>
  `;
}

export function homePage({ shop, status, visitor }) {
  const body = html`
    <section class="hero">
      <img class="hero-art" src="/dither.png" alt="" width="1920" height="480" />
      <div class="wrap hero-text">
        <p class="kicker">${status.now.date}</p>
        <h1 class="display">Roasted on Monday, poured all week.</h1>
        ${statusLine(status)}
        <p class="hero-links"><a href="/menu">See the menu</a><a href="#hours">Opening hours</a></p>
      </div>
    </section>

    <div class="wrap stack">
      <section>
        <div class="section-head">
          <h2>On the bar this week</h2>
          <a class="more" href="/menu">Full menu</a>
        </div>
        <div class="cards">
          ${featured.map(
            (item) => html`
              <article class="card">
                <p class="kicker">${menu.find((s) => s.items.includes(item)).title}</p>
                <h3 class="title">${item.name}</h3>
                <p class="muted">${item.description}</p>
                ${price(item)}
              </article>
            `,
          )}
        </div>
      </section>

      <div class="split">
        <section id="hours">
          <div class="section-head">
            <h2>Opening hours</h2>
            <span class="more muted">${shop.timeZone}</span>
          </div>
          ${hoursTable(status)}
          <p class="muted note">
            It is ${status.now.time} here. The server works out “open now” from these hours on every request,
            in the <code>TIME_ZONE</code> you set.
          </p>
        </section>
        <section id="letter">
          <div class="section-head"><h2>The roast letter</h2></div>
          <p class="note-lead">One short email when a new coffee lands, about once a month.</p>
          ${signupForm()}
        </section>
      </div>

      <section>
        <div class="section-head"><h2>How this page is made</h2></div>
        <div class="split">
          <div class="prose">
            <p>
              Everything here comes from one <code>fetch(request, env, ctx)</code> function in
              <code>index.mjs</code>: HTML pages, a form, a JSON API, the stylesheet and the images. There is
              no framework, no build step and no dependency.
            </p>
            <p class="muted">
              This page was made for ${visitor.ip ?? "an unknown address"} at ${status.now.time}
              (${shop.timeZone}) and is not cached. The menu is cached for five minutes.
            </p>
          </div>
          <ul class="routes">
            <li>
              <a href="/menu"><code>GET /menu</code></a> the menu as a page
            </li>
            <li>
              <a href="/api/menu"><code>GET /api/menu</code></a> the same menu as JSON
            </li>
            <li>
              <a href="/api/hours"><code>GET /api/hours</code></a> hours and “open now”
            </li>
            <li>
              <a href="/subscribe"><code>POST /subscribe</code></a> the form, as HTML or JSON
            </li>
          </ul>
        </div>
      </section>
    </div>
  `;
  return layout({ shop, title: null, path: "/", body });
}

export function menuPage({ shop }) {
  const body = html`
    <div class="wrap stack page">
      <header class="page-head">
        <p class="kicker">Menu</p>
        <h1 class="display">What we pour</h1>
        <p class="dek">Prices include VAT. The same list is at <a href="/api/menu">/api/menu</a> as JSON.</p>
      </header>
      <div class="menu">
        ${menu.map(
          (section) => html`
            <section class="menu-section" id="${section.id}">
              <div class="section-head"><h2>${section.title}</h2></div>
              <p class="muted note-lead">${section.note}</p>
              <ul class="items">
                ${section.items.map(
                  (item) => html`
                    <li>
                      <div>
                        <p class="item-name">${item.name}</p>
                        <p class="muted">${item.description}</p>
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

export function subscribePage({ shop, values, errors }) {
  const body = html`
    <div class="wrap stack page">
      <div class="split">
        <header class="page-head">
          <p class="kicker">Newsletter</p>
          <h1 class="display">The roast letter</h1>
          <p class="dek">
            One short email when a new coffee lands, about once a month: where it is from, how it tastes and
            how we brew it. Nothing else.
          </p>
        </header>
        <section class="form-panel">
          ${errors ? html`<p class="alert" role="alert">Please check the form.</p>` : ""}
          ${signupForm({ values, errors })}
        </section>
      </div>
    </div>
  `;
  return layout({ shop, title: "Newsletter", path: "/subscribe", body });
}

export function thanksPage({ shop, signup }) {
  const body = html`
    <div class="wrap stack page">
      <header class="page-head">
        <p class="kicker">The roast letter</p>
        <h1 class="display">Thanks${signup.name ? `, ${signup.name}` : ""}.</h1>
        <p class="dek">We will write to ${signup.email} when the next coffee lands.</p>
        <p class="muted note">
          This demo keeps nothing: it logs the sign-up after answering (with <code>ctx.waitUntil</code>), so
          you can see it on the Logs tab. A real shop would save it in a database.
        </p>
        <p class="hero-links"><a href="/">Back to today</a><a href="/menu">See the menu</a></p>
      </header>
    </div>
  `;
  return layout({ shop, title: "Thanks", path: null, body });
}

export function notFoundPage({ shop, path }) {
  const body = html`
    <div class="wrap stack page">
      <header class="page-head">
        <p class="kicker">404</p>
        <h1 class="display">Nothing on this shelf</h1>
        <p class="dek">There is no page at <code>${path}</code>.</p>
        <p class="hero-links"><a href="/">Back to today</a><a href="/menu">See the menu</a></p>
      </header>
    </div>
  `;
  return layout({ shop, title: "Not found", path: null, body });
}
