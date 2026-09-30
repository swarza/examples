import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import("next").NextConfig} */
export default {
  // swarza's adapter: `next build` writes .swarza/, which `swarza deploy` uploads.
  adapterPath: require.resolve("@swarza/next"),
  // Covers come from the MEDIA bucket's public address, which is only known at run time.
  // Two root layouts (site, admin); this renders the 404 for URLs that match neither.
  experimental: { globalNotFound: true },
  // Don't write AGENTS.md and CLAUDE.md into the example on `next dev`.
  agentRules: false,
  images: { unoptimized: true },
  // Previews show unpublished stories; only the newsroom itself may frame them.
  async headers() {
    return [
      {
        source: "/preview/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" }],
      },
    ];
  },
  async redirects() {
    return [{ source: "/feed", destination: "/rss.xml", permanent: true }];
  },
};
