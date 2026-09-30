import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import("next").NextConfig} */
export default {
  // swarza's adapter: `next build` writes .swarza/, which `swarza deploy` uploads.
  adapterPath: require.resolve("@swarza/next"),
  async redirects() {
    return [{ source: "/docs", destination: "/", permanent: false }];
  },
  async rewrites() {
    return [{ source: "/hello", destination: "/api/hello" }];
  },
  async headers() {
    // A rule for every path would send build assets through the app too; keep rules to pages.
    return [{ source: "/api/:path*", headers: [{ key: "x-example", value: "swarza" }] }];
  },
};
