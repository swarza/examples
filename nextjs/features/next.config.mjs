import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import("next").NextConfig} */
export default {
  // swarza's adapter: `next build` writes .swarza/, which `swarza deploy` uploads.
  adapterPath: require.resolve("@swarza/next"),
  async redirects() {
    // Old and printed addresses. proxy.ts makes one more: /live.
    return [
      { source: "/program", destination: "/schedule", permanent: true },
      { source: "/rsvp", destination: "/guestbook", permanent: false },
    ];
  },
  async rewrites() {
    return [{ source: "/schedule.json", destination: "/api/schedule" }];
  },
  async headers() {
    // A rule for every path would send build assets through the app too; keep rules to pages.
    return [{ source: "/api/:path*", headers: [{ key: "x-example", value: "swarza" }] }];
  },
};
