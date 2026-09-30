# Next.js on swarza

A site for Hydrate 26, a one-day web conference that does not exist. Each page does a real job for
the event and shows one Next.js feature on swarza, deployed with `@swarza/next`. The site's own
[Under the hood](app/under-the-hood/page.tsx) page lists the same mapping and times the database and
the bucket live.

| Page                      | What it shows                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `/`                       | Landing page, prerendered at build                                                                  |
| `/schedule`               | ISR (`revalidate = 30`) over a data cache entry tagged `program`                                    |
| `/api/revalidate`         | On-demand revalidation (`POST`): "the organisers publish a change"                                  |
| `/talks/[slug]`           | `generateStaticParams`; the lightning talks are left out and render on first request                |
| `/now`                    | Live board: rendered per request with `headers()` and `cookies()`, two parts streamed with Suspense |
| `/agenda`                 | Server Actions that save picks in a cookie, then `revalidatePath`                                   |
| `/venue`                  | `next/image` with a blur placeholder                                                                |
| `/guestbook`              | Attendee wall: a swarza database with Drizzle (`@libsql/client/web`)                                |
| `/uploads`                | Photos: uploads to a Storage bucket (AWS SDK), listed, read through the app or by signed link       |
| `/under-the-hood`         | Which feature each page uses, plus database and bucket timings measured live                        |
| `/api/schedule`           | Route handler on Node.js, also at `/schedule.json` (a rewrite)                                      |
| `/api/now`                | Route handler on the edge runtime                                                                   |
| `/api/db`, `/api/storage` | The timings as JSON                                                                                 |
| `proxy.ts`                | Middleware: redirects `/live` to `/now`, passes the country on, counts visits to `/now`             |
| `next.config.mjs`         | Redirects (`/program`, `/rsvp`), a rewrite and a headers rule                                       |
| `jobs/heartbeat.ts`       | A scheduled job every 5 minutes that logs how many people signed the wall                           |

Without a database or a bucket the site still works: the wall, the photos and the timings say what
to bind.

## What you need

- Node.js 20.9 or newer (`node -v`) and npm.
- An account on stg.swarza.com. Sign up at https://stg.swarza.com/sign-up: the 14-day trial needs no card.

The commands below use `https://stg.swarza.com`. If you were given another address, use that.

## 1. Install the CLI and sign in

The CLI is not on npm. Your Swarza site serves it:

```bash
npm i -g https://stg.swarza.com/cli/swarza-cli.tgz
swarza --version
swarza login
```

`swarza login` prints a code and opens the browser. Check that the browser shows the same code, then
approve. `swarza --help` lists the commands.

## 2. Get the example

```bash
npx degit swarza/examples/nextjs/features my-app && cd my-app
npm install
```

`@swarza/next` needs Next.js 16.2 or newer. The example uses 16.3.

## 3. Create the application, a database and a bucket

In the dashboard at https://stg.swarza.com/app:

1. **Applications**: create one. Its name is its address, for example `my-example`.
2. **Databases**: create one and open it. Under Applications on its page, choose your application, keep
   the name `DATABASE` and the access "Read and write", and press Bind. The application now receives
   `DATABASE_URL` and `DATABASE_AUTH_TOKEN`, which `lib/db.ts` reads.
3. **Storage**: create a bucket and open it. Bind it to your application with the name `STORAGE` and
   "Read and write" access. The application receives `STORAGE_ENDPOINT`, `STORAGE_BUCKET`,
   `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID` and `STORAGE_SECRET_ACCESS_KEY`, which `lib/storage.ts`
   reads. Make the bucket public if you want `/uploads` to show public links (`STORAGE_PUBLIC_URL`).

The example needs no other environment variables. Add your own on the application's Environment tab.
An application restarts with new bindings and variables within seconds.

## 4. Create the table

The attendee wall needs its table. Run the migrations from your machine with an access token: on the
database's page, copy its connection URL, then create an access token under "Access tokens for other
tools" (it is shown once).

```bash
DATABASE_URL=<connection URL> DATABASE_AUTH_TOKEN=<token> npm run db:migrate
```

## 5. Deploy

```bash
npm run deploy   # next build, then swarza deploy --prod
```

The first time, `swarza deploy` asks which application to use, and saves your answer as `"app"` in
`swarza.json`. Later deploys read it from there. It prints the address when the deploy is live. A
new address can take up to a minute to answer everywhere.

To deploy a preview instead, run `next build` and then `swarza deploy` (no `--prod`): it is named after
your git branch.

`swarza.json` also lists the scheduled job `jobs/heartbeat.ts` (every 5 minutes). It starts with a
production deploy, and its output (how many people signed the wall) shows in the application's Logs tab.

Measured on staging on a Starter application (a quarter of a CPU), 50 calls each, p50 / p90: a query
0.53 / 1.19 ms, 20 rows with Drizzle 0.88 / 1.87 ms, an insert 1.01 / 1.80 ms, a transaction
with two writes 2.42 / 3.97 ms, a batch of three statements 1.54 / 2.42 ms. The occasional
maximum of 60 to 80 ms happens when the quarter CPU runs out for the rest of a 100 ms window. With
a full core the maximum stays under 3 ms.

Measured on a Starter application (a quarter of a CPU) from Poland: p50 of 30 to 41 ms for every page and
a cold start of 0.5 s after the idle stop. Compared with `next start` on the same machine, it
served 29% more SSR requests per second and 2.8 times more for prerendered pages (see
`docs/operations/staging.md`).
