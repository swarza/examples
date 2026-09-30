import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

/** Rows the /db page writes to measure writes (it keeps the last thousand). */
export const hits = sqliteTable("hits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  path: text("path").notNull(),
  at: integer("at", { mode: "timestamp_ms" }).notNull(),
});
