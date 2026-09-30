/**
 * The database bound to this application (swarza Databases): the app gets DATABASE_URL and
 * DATABASE_AUTH_TOKEN. `@libsql/client/web` speaks the protocol in plain JavaScript, with no native
 * module to build for the server.
 */
import { createClient, type Client } from "@libsql/client/web";
import { createRequire } from "node:module";
import { drizzle } from "drizzle-orm/libsql/web";
import { migrate } from "./migrate";
import * as schema from "./schema";

let rawClient: Client | null = null;
let instance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let migrated: Promise<void> | null = null;

/** Whether a database is bound; pages show setup help when it isn't. */
export const hasDatabase = () => Boolean(process.env.DATABASE_URL);

/**
 * The libSQL client, created on first use: `next build` runs without the variables. For local
 * development, `DATABASE_URL=file:local.db` opens a SQLite file instead (loaded at run time, so it
 * never enters the deployed bundle).
 */
export function client() {
  if (!rawClient) {
    const url = process.env.DATABASE_URL!;
    rawClient = url.startsWith("file:")
      ? (createRequire(import.meta.url)("@libsql/client") as typeof import("@libsql/client")).createClient({
          url,
        })
      : createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  }
  return rawClient;
}

/** Drizzle over the same connection, after this process has applied any new migrations. */
export async function db() {
  migrated ??= migrate(client()).catch((e) => {
    migrated = null;
    throw e;
  });
  await migrated;
  instance ??= drizzle(client(), { schema });
  return instance;
}
