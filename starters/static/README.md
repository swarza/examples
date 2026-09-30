# A static site on swarza

Plain HTML and CSS, served from swarza's CDN. `swarza.json` sets the folder to serve, a redirect and
response headers. Everything outside `public/`, this README included, is uploaded but never served.

| Path        | What it shows                                                |
| ----------- | ------------------------------------------------------------ |
| `/`         | `public/index.html`                                          |
| `/old/*`    | A redirect (301) from `swarza.json`                          |
| `/missing`  | `public/404.html`, with status 404                           |
| `/assets/*` | Long-lived `Cache-Control` from the `headers` in swarza.json |

## Deploy

You need Node.js 20.9 or newer and an account on https://stg.swarza.com (the 14-day trial needs no
card).

```bash
npx degit swarza/examples/starters/static static-site && cd static-site
npm i -g https://stg.swarza.com/cli/swarza-cli.tgz
swarza login
swarza deploy --prod
```

The first deploy asks which application to use. Type a new name, such as `static-yourname`
(names are unique across all of swarza), and it creates the application and saves the name in
`swarza.json`. The CLI prints the address when the deploy is live.

Deploy without `--prod` to get a preview named after your git branch instead.
