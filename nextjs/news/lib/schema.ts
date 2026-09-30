/**
 * The newsroom's tables, in the application's swarza database (SQLite-compatible). Dates are
 * stored as Unix milliseconds.
 */
import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch() * 1000)`;

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  position: integer("position").notNull().default(0),
});

/** People who sign in to /admin; each is also a byline. */
export const editors = sqliteTable("editors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio").notNull().default(""),
  /** scrypt, see lib/password.ts. */
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] })
    .notNull()
    .default("editor"),
  /** Bumped to sign the editor out everywhere. */
  sessionVersion: integer("session_version").notNull().default(1),
  createdAt: integer("created_at").notNull().default(now),
});

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    /** The line under the headline. */
    dek: text("dek").notNull().default(""),
    /** Markdown; raw HTML is not rendered. */
    body: text("body").notNull().default(""),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    authorId: integer("author_id").references(() => editors.id, { onDelete: "set null" }),
    /** A key in the MEDIA bucket. */
    coverKey: text("cover_key"),
    coverAlt: text("cover_alt").notNull().default(""),
    status: text("status", { enum: ["draft", "scheduled", "published"] })
      .notNull()
      .default("draft"),
    /** The lead story on the home page (the newest one wins). */
    hero: integer("hero", { mode: "boolean" }).notNull().default(false),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    publishedAt: integer("published_at"),
    /** Reads over the last 7 days, rolled up hourly by jobs/most-read.ts. */
    reads7d: integer("reads_7d").notNull().default(0),
    createdAt: integer("created_at").notNull().default(now),
    updatedAt: integer("updated_at").notNull().default(now),
  },
  (t) => [
    uniqueIndex("posts_slug").on(t.slug),
    index("posts_status_published").on(t.status, t.publishedAt),
    index("posts_category").on(t.categoryId, t.publishedAt),
  ],
);

/** Reads per post per day (UTC), counted by a beacon so cached pages still count. */
export const postViews = sqliteTable(
  "post_views",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    day: text("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.postId, t.day] })],
);

/** The contact form's inbox. */
export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull().default(""),
    body: text("body").notNull(),
    /** A hash of the sender's address, for the hourly limit (never the address itself). */
    ipHash: text("ip_hash").notNull(),
    read: integer("read", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull().default(now),
  },
  (t) => [index("messages_ip").on(t.ipHash, t.createdAt)],
);

/** Newsroom settings as JSON by key; "front-page" holds the front page's layout (lib/front-page.ts). */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").notNull().default(now),
});

export type Category = typeof categories.$inferSelect;
export type Editor = typeof editors.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Message = typeof messages.$inferSelect;
