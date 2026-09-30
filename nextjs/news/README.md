# Dispatch: a news site on swarza

A black-and-white news site with a newsroom to write in. It uses everything an application on
swarza can have, and nothing else: Next.js on the runtime, a database, a storage bucket,
scheduled jobs, environment variables, previews and request logs. The stories in its demo content
are made up.

| Where                                     | What it shows                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/`                                       | The front page: lead story, top stories, featured, latest, sections. "Most read" streams in.   |
| `/post/[slug]`                            | Incremental regeneration: rendered on the first visit, cached until the newsroom changes.      |
| `/category/[slug]`, `/author/[slug]`      | Section and writer pages from the data cache, tagged `posts`.                                  |
| `/search`, `/contact`                     | A dynamic search (SQL `LIKE`) and a form saved to the database, 3 messages an hour per sender. |
| `/rss.xml`, `/sitemap.xml`, `/robots.txt` | Route handlers and metadata routes.                                                            |
| `/admin`                                  | The newsroom: stories with covers, scheduling, sections, editors, inbox, demo content.         |
| `proxy.ts`                                | Middleware that sends signed-out visitors from `/admin` to the sign-in page.                   |
| `jobs/publish.ts`                         | Every minute: publishes scheduled stories and refreshes the cached pages.                      |
| `jobs/most-read.ts`                       | Every hour: adds up reads for "Most read" and prunes old counts.                               |

Covers are uploaded to a public bucket and served from its CDN address. Demo covers are drawn as
SVG (`lib/covers.ts`). Passwords are scrypt hashes, sessions are HMAC-signed cookies, and Markdown
is rendered with raw HTML switched off.

## What you need

- Node.js 20.9 or newer (`node -v`) and npm.
- An account on stg.swarza.com (sign up at https://stg.swarza.com/sign-up: the 14-day trial needs no card).

The commands use `https://stg.swarza.com`. If you were given another address, use that.

## Set it up

1. **Install the CLI and sign in.** It is not on npm: your Swarza site serves it.

   ```bash
   npm i -g https://stg.swarza.com/cli/swarza-cli.tgz
   swarza login
   ```

   `swarza login` prints a code and opens the browser: check that the code matches, then approve.

2. **Get the example** and install it:

   ```bash
   npx degit swarza/examples/nextjs/news news && cd news
   npm install
   ```

3. **Create the application** in the dashboard, or with `swarza apps create news-yourname`.
   Application names are unique across all of swarza, so add your own name. Then put it in
   `swarza.json` as `"app": "news-yourname"`, or let the first deploy ask for it and save it there.
4. **Create a database** under Databases and bind it to the application. The name `DATABASE` is
   the default and what the code reads (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`). The tables are
   created on the first request (`lib/migrate.ts`).
5. **Create a bucket** under Storage, make it **public**, and bind it to the application as
   `MEDIA` with **Read and write** access. The app gets `MEDIA_ENDPOINT`, `MEDIA_BUCKET`, the key pair and
   `MEDIA_PUBLIC_URL`.
6. **Set the variables** on the application's Environment tab:

   | Name                | Value                                                                                        |
   | ------------------- | -------------------------------------------------------------------------------------------- |
   | `SESSION_SECRET`    | 32 or more random characters (`openssl rand -hex 32`)                                        |
   | `ADMIN_EMAIL`       | The first editor's email                                                                     |
   | `ADMIN_PASSWORD`    | Their password, 10 characters or more; used once, on the first sign-in                       |
   | `SITE_URL`          | The application's address with `https://`, e.g. `https://news-yourname.sites.stg.swarza.com` |
   | `REVALIDATE_SECRET` | 16 or more random characters, for the jobs to refresh the pages                              |

7. **Deploy**:

   ```bash
   npm run deploy      # next build, then swarza deploy --prod
   ```

   The address prints when the deploy is live. A new address can take up to a minute to answer
   everywhere.

8. **Sign in** at `/admin` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then **Load demo content** on
   the desk. One of the demo stories is scheduled a few minutes ahead: watch the publishing job
   put it live in the application's Logs.

## Working on it

- `swarza deploy` without `--prod` deploys a preview named after your git branch, at
  `https://<app>--<branch>.sites.<domain>`. Previews share the database and the bucket, so a
  preview writes to the same newsroom.
- After changing `lib/schema.ts`, run `npm run db:generate`. The next deploy applies the migration on
  its first request.
- Each request shows in the Logs tab a few minutes later, next to what the app and the jobs print.
- To use your own domain, add it on the application's Domains tab and point a CNAME at the
  address shown there. Update `SITE_URL` to match.
