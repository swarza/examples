# A fetch app on swarza: Halftone Coffee

The website of a small, made-up coffee roaster and café. One `fetch` handler in `index.mjs` serves
everything: HTML pages, a form, a JSON API, the stylesheet and the images. swarza runs it in
Node.js 24 for every request. There are no dependencies and no build step, only plain `.mjs` files.

The home page works out whether the shop is open from the opening hours and the current time in the
shop's time zone, on every request. The menu page and `/api/menu` read the same data, so the page and
the API never disagree.

The yellow **?** bubbles on the pages point at the things the server does: what happens at that spot
and how to try it yourself, with `curl` commands that use the address you opened. Their texts are in
`features.mjs`, and `/how-it-works` lists them all. The "Show features" switch in the corner hides
them (your browser remembers it). Without JavaScript each bubble still opens, as a sheet at the bottom
of the screen.

| Path                | What it shows                                                                          |
| ------------------- | -------------------------------------------------------------------------------------- |
| `/`                 | Home: open now or not, this week's coffee, opening hours, the sign-up form; not cached |
| `/menu`             | The menu as a page, cached for 5 minutes (`Cache-Control`)                             |
| `/subscribe`        | The newsletter form. `POST` validates it and answers with a thank-you page or a 422    |
| `/how-it-works`     | Every feature bubble in one list, with the steps to test it                            |
| `/api`              | The list of JSON endpoints                                                             |
| `/api/menu`         | The menu as JSON, cached for 5 minutes                                                 |
| `/api/hours`        | Opening hours and whether the shop is open now, as JSON; not cached                    |
| anything else       | A 404 page (or JSON under `/api/`); a known path with another method gets a 405        |
| `jobs/tomorrow.mjs` | A scheduled job that logs tomorrow's opening hours every evening                       |

Send the form with `Accept: application/json` and it answers with JSON instead of a page:

```bash
curl -X POST https://<your-app>/subscribe -H 'accept: application/json' -d 'email=you@example.com'
```

## Files

- `index.mjs`: the `fetch` handler and the routes. It also serves the files in `assets/`.
- `data.mjs`: the settings, the menu and the opening hours.
- `clock.mjs`: "are we open?" in the shop's time zone.
- `pages.mjs`: the HTML templates. Anything a visitor types is escaped.
- `features.mjs`: the texts of the feature bubbles and of `/how-it-works`.
- `assets/`: the stylesheet, the favicon, the dithered coffee bag in the hero and `hints.js`, the
  small script that opens the bubbles.
- `jobs/tomorrow.mjs`: the scheduled job.

## Environment variables

All are optional; the app runs without them.

| Name                 | Default           | What it does                                                            |
| -------------------- | ----------------- | ----------------------------------------------------------------------- |
| `SHOP_NAME`          | `Halftone Coffee` | The name in the header, the titles and the job's log line               |
| `TIME_ZONE`          | `Europe/London`   | The time zone of the opening hours, such as `Europe/Warsaw`             |
| `SIGNUP_WEBHOOK_URL` | none              | If set, each sign-up is also posted there as JSON (`{ "text": "..." }`) |

A sign-up is logged after the answer has gone out, with `ctx.waitUntil`. The demo stores nothing; a
real shop would save sign-ups in a database.

## Deploy

You need Node.js 20.9 or newer and an account on https://stg.swarza.com (the 14-day trial needs no
card).

```bash
npx degit swarza/examples/starters/fetch-api my-api && cd my-api
npm i -g https://stg.swarza.com/cli/swarza-cli.tgz
swarza login
swarza deploy --prod
```

The first deploy asks which application to use. Type a new name, such as `cafe-yourname` (names are
unique across all of swarza), and it creates the application and saves the name in `swarza.json`.
The CLI prints the address when the deploy is live.

Then open the application in the dashboard:

- **Environment**: set `SHOP_NAME` and `TIME_ZONE` and reload the home page. The running app picks
  them up in about 10 seconds.
- **Scheduled jobs**: the evening job and its next run. Schedules are in UTC, so `0 18 * * *` in
  `swarza.json` is 18:00 UTC; change it to suit your time zone. **Run now** runs it at once.
- **Logs**: every request, the sign-ups and the job's output.

If you add npm packages, run `npm install --omit=dev` before deploying: swarza uploads
`node_modules` with your code and does not install anything itself.
