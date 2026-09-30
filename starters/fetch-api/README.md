# A fetch API on swarza

A small JSON API with no dependencies and no build step: `index.mjs` exports a `fetch` handler, and
swarza runs it in Node.js 24. A scheduled job logs a line every 10 minutes.

| Path                 | What it shows                                                        |
| -------------------- | -------------------------------------------------------------------- |
| `/`                  | Reads the `GREETING` variable from the Environment tab               |
| `/api/time`          | A response cached for 10 seconds (`Cache-Control`)                   |
| `/api/echo`          | The query string and the visitor's IP (`X-Forwarded-For`)            |
| `jobs/heartbeat.mjs` | A scheduled job (`scheduledJobs` in `swarza.json`); see the Logs tab |

## Deploy

You need Node.js 20.9 or newer and an account on https://stg.swarza.com (the 14-day trial needs no
card).

```bash
npx degit swarza/examples/starters/fetch-api my-api && cd my-api
npm i -g https://stg.swarza.com/cli/swarza-cli.tgz
swarza login
swarza deploy --prod
```

The first deploy asks which application to use. Type a new name, such as `api-yourname` (names
are unique across all of swarza), and it creates the application and saves the name in
`swarza.json`. The CLI prints the address when the deploy is live.

Then open the application in the dashboard:

- **Environment**: add `GREETING` and reload `/`. The running app picks it up in about 10 seconds.
- **Scheduled jobs**: the heartbeat and its next run. **Run now** runs it at once.
- **Logs**: every request, and the job's output.

If you add npm packages, run `npm install --omit=dev` before deploying: swarza uploads
`node_modules` with your code and does not install anything itself.
