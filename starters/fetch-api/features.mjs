/**
 * What each feature bubble on the pages says: what the server does there, and how to see it for
 * yourself. The pages show one bubble per feature next to the thing it explains, and /how-it-works
 * lists them all. `steps` gets the address the page was requested at, so the curl commands can be
 * copied as they are. Text in `backticks` is shown as code.
 */

export const features = [
  {
    id: "no-store",
    title: "A fresh page on every request",
    what: "`index.mjs` renders this page for every request and sends `Cache-Control: no-store`, so neither the CDN nor your browser keeps a copy. The open sign and the time are always current.",
    on: [["/", "Home"]],
    steps: (origin) => [
      { text: "Reload the page. The time under Opening hours is the time of your request." },
      { text: "Look at the headers:", code: `curl -sI ${origin}/ | grep -i cache-control` },
    ],
  },
  {
    id: "open-now",
    title: "Open now, worked out on the server",
    what: "The server's clock runs in UTC. On every request it turns the time into the shop's time zone, from the `TIME_ZONE` variable, and checks it against the opening hours.",
    on: [["/", "Home"]],
    steps: (origin) => [
      {
        text: "On the Environment tab, set `TIME_ZONE` to a zone on the other side of the world, such as `Asia/Tokyo`.",
      },
      { text: "Wait about 10 seconds and reload. The sign and the highlighted day follow the new zone." },
      { text: "The same answer as JSON:", code: `curl ${origin}/api/hours` },
    ],
  },
  {
    id: "shop-name",
    title: "The name is a variable",
    what: "`SHOP_NAME` is an environment variable. The app reads it from `env` on every request, so the header, the page titles and the evening job all use it.",
    on: [["/", "Home"]],
    steps: () => [
      { text: "On the Environment tab, set `SHOP_NAME` to a name of your own." },
      { text: "Wait about 10 seconds and reload. You do not need to deploy again." },
    ],
  },
  {
    id: "static-files",
    title: "Files from the same handler",
    what: "This picture, the stylesheet and the script behind these bubbles are files in `assets/`. The same `fetch` handler reads them once when a worker starts and serves them with a one-day cache.",
    on: [["/", "Home"]],
    steps: (origin) => [
      { text: "Ask for the picture:", code: `curl -I ${origin}/dither.png` },
      { text: "Look for `content-type: image/png` and `cache-control: public, max-age=86400`." },
    ],
  },
  {
    id: "api-json",
    title: "The same data as JSON",
    what: "The pages and `/api/menu` read the same list in `data.mjs`, so the menu page and the API never disagree.",
    on: [
      ["/", "Home"],
      ["/menu", "Menu"],
    ],
    steps: (origin) => [
      { text: "Get the menu as JSON:", code: `curl -i ${origin}/api/menu` },
      { text: "`/api` lists every endpoint." },
    ],
  },
  {
    id: "menu-cache",
    title: "Cached by the CDN for 5 minutes",
    what: "The menu rarely changes, so `index.mjs` sends it with `Cache-Control: public, max-age=300`. For five minutes the CDN answers from its copy without running the app.",
    on: [["/menu", "Menu"]],
    steps: (origin) => [
      { text: "Open your browser's dev tools on the Network tab and reload this page twice." },
      {
        text: "Compare the response headers: `x-cache` goes from Miss to Hit, and `age` counts the seconds since the CDN stored its copy.",
      },
      { text: "Or from a terminal, twice:", code: `curl -sI ${origin}/menu | grep -iE '^(age|x-cache)'` },
    ],
  },
  {
    id: "form-post",
    title: "A form that also speaks JSON",
    what: "The form POSTs to `/subscribe`. The server checks the fields and answers with a thank-you page, or with the form and a 422. Send `Accept: application/json` and the same route answers in JSON.",
    on: [
      ["/", "Home"],
      ["/subscribe", "Newsletter"],
    ],
    steps: (origin) => [
      {
        text: "Sign up with the email `a@b`. Your browser lets it through, the server does not: you get the form back with status 422.",
      },
      {
        text: "The JSON version, which answers 201:",
        code: `curl -i ${origin}/subscribe -H 'accept: application/json' -d 'email=you@example.com'`,
      },
      { text: "Send `email=nope` instead to get the 422 as JSON." },
    ],
  },
  {
    id: "wait-until",
    title: "Work after the answer",
    what: "Once the answer is on its way, `ctx.waitUntil` logs the sign-up and, if `SIGNUP_WEBHOOK_URL` is set, posts it there. Your browser does not wait for either.",
    on: [["/subscribe", "Newsletter and thank-you page"]],
    steps: () => [
      {
        text: "Sign up, then open the Logs tab: there is a line like `newsletter sign-up: y***@example.com`.",
      },
      {
        text: "On the Environment tab, set `SIGNUP_WEBHOOK_URL` to a Slack incoming webhook or a webhook.site address and sign up again. The sign-up arrives there too.",
      },
    ],
  },
  {
    id: "visitor-ip",
    title: "Your IP, from X-Forwarded-For",
    what: "swarza puts the visitor's IP address first in the `X-Forwarded-For` request header. The app reads it from `request.headers` when it renders the page.",
    on: [["/", "Home"]],
    steps: () => [
      { text: "Open this page on your phone over mobile data. It shows a different address." },
      { text: "Each request is also on the Logs tab." },
    ],
  },
  {
    id: "scheduled-job",
    title: "A job every evening",
    what: "`jobs/tomorrow.mjs` runs at 18:00 UTC every day (`scheduledJobs` in `swarza.json`) and logs tomorrow's opening hours for whoever opens up.",
    on: [["/", "Home"]],
    steps: () => [
      { text: "On the Scheduled jobs tab, press Run now." },
      {
        text: "Open the Logs tab: there is a line like `Halftone Coffee opens at 07:30 and closes at 17:00 tomorrow`.",
      },
    ],
  },
  {
    id: "not-found",
    title: "404, 405 and escaping",
    what: "Any other path gets this page with status 404, or a JSON 404 under `/api/`. The path is escaped, so whatever you type shows as text. A known path with the wrong method gets a 405 and an `Allow` header.",
    on: [["/nothing-here", "Any unknown path"]],
    steps: (origin) => [
      { text: "A JSON 404:", code: `curl -i ${origin}/api/nope` },
      { text: "A 405 with `Allow: GET`:", code: `curl -i -X DELETE ${origin}/menu` },
      { text: "Open this address: the tags show as plain text.", code: `${origin}/%3Cb%3Ehello%3C%2Fb%3E` },
    ],
  },
];

export const feature = (id) => {
  const found = features.find((f) => f.id === id);
  if (!found) throw new Error(`No feature "${id}" in features.mjs`);
  return found;
};
