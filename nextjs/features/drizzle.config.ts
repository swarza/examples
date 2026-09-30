import { defineConfig } from "drizzle-kit";

/** `DATABASE_URL=libsql://db.<sites domain> DATABASE_AUTH_TOKEN=… npm run db:migrate` */
export default defineConfig({
  dialect: "turso",
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN },
});
