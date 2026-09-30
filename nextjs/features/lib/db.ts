/**
 * The database bound to this site (swarza Databases): the site's apps get DATABASE_URL and
 * DATABASE_AUTH_TOKEN. `@libsql/client/web` speaks the protocol in plain JavaScript (no native
 * module to build for the server), which is all a ws:// or libsql:// URL needs.
 */
import { createClient, type Client } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql/web";
import * as schema from "./schema";

let rawClient: Client | null = null;
let instance: ReturnType<typeof drizzle<typeof schema>> | null = null;

/** Whether a database is bound. Pages check this at request time and explain how to bind one. */
export const hasDatabase = () => Boolean(process.env.DATABASE_URL);

/** The libSQL client, created on first use: `next build` runs without the variables. */
export function client() {
  rawClient ??= createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN });
  return rawClient;
}

/** Drizzle over the same connection. */
export function db() {
  instance ??= drizzle(client(), { schema });
  return instance;
}
