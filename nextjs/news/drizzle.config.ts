import { defineConfig } from "drizzle-kit";

/**
 * `npm run db:generate` writes a migration after a schema change. The app applies migrations itself on
 * first use (lib/migrate.ts), so deploying is enough. To run them from your machine instead:
 * `DATABASE_URL=libsql://db.<sites domain> DATABASE_AUTH_TOKEN=… npx drizzle-kit migrate`.
 */
export default defineConfig({
  dialect: "turso",
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "", authToken: process.env.DATABASE_AUTH_TOKEN },
});
