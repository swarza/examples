/**
 * What the public pages read. Everything goes through Next's data cache under the tag "posts",
 * so pages are served from cache and a change in /admin (or a scheduled post going live)
 * refreshes them with one `revalidateTag("posts")`. Entries also expire after a minute, in case a
 * refresh request doesn't get through.
 */
import { and, desc, eq, ne, notInArray, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "./db";
import {
  FRONT_PAGE_KEY,
  resolveFrontPage,
  type FeaturedModule,
  type Module,
  type SectionModule,
} from "./front-page";
import { categories, editors, posts, settings, type Category } from "./schema";

export const PAGE_SIZE = 12;

export type Card = {
  id: number;
  slug: string;
  title: string;
  dek: string;
  coverKey: string | null;
  coverAlt: string;
  publishedAt: number | null;
  reads7d: number;
  category: { slug: string; name: string } | null;
  author: { slug: string; name: string } | null;
};

export type Article = Card & { body: string; hero: boolean; featured: boolean; categoryId: number | null };

const cardFields = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  dek: posts.dek,
  coverKey: posts.coverKey,
  coverAlt: posts.coverAlt,
  publishedAt: posts.publishedAt,
  reads7d: posts.reads7d,
  categorySlug: categories.slug,
  categoryName: categories.name,
  authorSlug: editors.slug,
  authorName: editors.name,
};

type Row = {
  [K in keyof typeof cardFields]: unknown;
};

function toCard(r: Row): Card {
  return {
    id: r.id as number,
    slug: r.slug as string,
    title: r.title as string,
    dek: r.dek as string,
    coverKey: (r.coverKey as string | null) ?? null,
    coverAlt: r.coverAlt as string,
    publishedAt: (r.publishedAt as number | null) ?? null,
    reads7d: r.reads7d as number,
    category: r.categorySlug ? { slug: r.categorySlug as string, name: r.categoryName as string } : null,
    author: r.authorSlug ? { slug: r.authorSlug as string, name: r.authorName as string } : null,
  };
}

const published = eq(posts.status, "published");

async function cards(where = published, limit = PAGE_SIZE, offset = 0, order = desc(posts.publishedAt)) {
  const d = await db();
  const rows = await d
    .select(cardFields)
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(editors, eq(editors.id, posts.authorId))
    .where(where)
    .orderBy(order, desc(posts.id))
    .limit(limit)
    .offset(offset);
  return rows.map(toCard);
}

const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) =>
  unstable_cache(fn, [key], { tags: ["posts"], revalidate: 60 });

export const getCategories = cached(async (): Promise<Category[]> => {
  if (!hasDatabase()) return [];
  const d = await db();
  return d.select().from(categories).orderBy(categories.position, categories.name);
}, "categories");

/** The stored front-page arrangement (lib/front-page.ts), complete and valid for today's sections. */
export const getFrontPage = cached(async (): Promise<Module[]> => {
  const all = await getCategories();
  if (!hasDatabase()) return resolveFrontPage(null, all);
  const d = await db();
  const [row] = await d.select().from(settings).where(eq(settings.key, FRONT_PAGE_KEY));
  return resolveFrontPage(parseJson(row?.value), all);
}, "front-page");

/** JSON.parse that returns null for anything it can't read. */
export function parseJson(text: string | null | undefined): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export type HomeSection = { category: Category; posts: Card[]; total: number };

/** The stories for each module of an arrangement; hidden modules get none. */
export type Home = {
  /** Published stories in all; zero means an empty newsroom. */
  total: number;
  lead: Card | null;
  top: Card[];
  featured: Card[];
  latest: Card[];
  sections: HomeSection[];
};

/** How many stories a row of Featured or a section shows in each layout. */
export const rowSize = (m: FeaturedModule | SectionModule) =>
  m.layout === "list" || (m.kind === "featured" && m.layout === "equal") ? 4 : 3;

/**
 * Stories for the front page, in the arrangement's order: each story shows once, so a module
 * takes what the modules above it left, and a hidden module's stories flow on to the next. The
 * lead is the hero story, or the newest one, and it is chosen first wherever it sits. A section
 * fills up when it has too few stories nobody has seen yet: it borrows ones shown at least two
 * modules up (so never on the same screen), but never the lead; if that still leaves it short, it
 * shows fewer, as a list.
 */
export const getHome = cached(async (modules: Module[]): Promise<Home> => {
  const home: Home = { total: 0, lead: null, top: [], featured: [], latest: [], sections: [] };
  if (!hasDatabase()) return home;
  const d = await db();
  const [count] = await d
    .select({ n: sql<number>`count(*)` })
    .from(posts)
    .where(published);
  home.total = Number(count?.n ?? 0);
  if (!home.total) return home;
  const all = await getCategories();
  const used = new Map<number, number>(); // story id → the position of the module showing it
  const unused = () => (used.size ? notInArray(posts.id, [...used.keys()]) : undefined);
  const visible = modules.filter((m) => !m.hidden);
  const at = (i: number) => (list: Card[]) => {
    for (const p of list) if (!used.has(p.id)) used.set(p.id, i);
    return list;
  };
  // The lead and Top stories come first wherever the lead sits, so a module above it never takes
  // the hero story.
  const leadAt = visible.findIndex((m) => m.kind === "lead");
  if (leadAt >= 0) {
    const [hero] = await cards(and(published, eq(posts.hero, true)), 1);
    const lead = hero ?? (await cards(published, 1))[0] ?? null;
    home.lead = lead ? at(leadAt)([lead])[0]! : null;
    home.top = at(leadAt)(await cards(and(published, unused()), 6));
  }
  for (const [i, m] of visible.entries()) {
    const take = at(i);
    if (m.kind === "lead") continue;
    if (m.kind === "featured") {
      home.featured = take(await cards(and(published, eq(posts.featured, true), unused()), rowSize(m)));
    } else if (m.kind === "latest") {
      home.latest = take(await cards(and(published, unused()), 10));
    } else {
      const category = all.find((c) => c.id === m.categoryId);
      if (!category) continue;
      const inCategory = and(published, eq(posts.categoryId, category.id));
      const recent = await cards(inCategory, 24);
      const isLead = (p: Card) => p.id === home.lead?.id;
      const fresh = recent.filter((p) => !used.has(p.id));
      const far = recent
        .filter((p) => (used.get(p.id) ?? i) < i - 1 && !isLead(p))
        .sort((a, b) => used.get(a.id)! - used.get(b.id)!);
      const list = take([...fresh, ...far].slice(0, rowSize(m)));
      if (!list.length) continue;
      const [row] = await d
        .select({ n: sql<number>`count(*)` })
        .from(posts)
        .where(inCategory);
      home.sections.push({ category, posts: list, total: Number(row?.n ?? list.length) });
    }
  }
  return home;
}, "home");

/** Most read this week, leaving out the Latest river it sits beside. */
export const getMostRead = cached(async (modules: Module[]): Promise<Card[]> => {
  if (!hasDatabase()) return [];
  const { latest } = await getHome(modules);
  const beside = latest.length
    ? notInArray(
        posts.id,
        latest.map((p) => p.id),
      )
    : undefined;
  return cards(and(published, beside), 5, 0, desc(posts.reads7d));
}, "most-read");

export const getArticle = cached(async (slug: string): Promise<Article | null> => {
  if (!hasDatabase()) return null;
  const d = await db();
  const [row] = await d
    .select({
      ...cardFields,
      body: posts.body,
      hero: posts.hero,
      featured: posts.featured,
      categoryId: posts.categoryId,
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(editors, eq(editors.id, posts.authorId))
    .where(and(published, eq(posts.slug, slug)));
  if (!row) return null;
  return {
    ...toCard(row),
    body: row.body,
    hero: row.hero,
    featured: row.featured,
    categoryId: row.categoryId,
  };
}, "article");

export type PreviewStory = Article & { status: "draft" | "scheduled" | "published" };

/** Any story by id, whatever its status, for the preview. Not cached: editors see their last save. */
export async function getPreviewStory(id: number): Promise<PreviewStory | null> {
  if (!hasDatabase() || !Number.isSafeInteger(id)) return null;
  const d = await db();
  const [row] = await d
    .select({
      ...cardFields,
      body: posts.body,
      hero: posts.hero,
      featured: posts.featured,
      categoryId: posts.categoryId,
      status: posts.status,
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(editors, eq(editors.id, posts.authorId))
    .where(eq(posts.id, id));
  if (!row) return null;
  return {
    ...toCard(row),
    body: row.body,
    hero: row.hero,
    featured: row.featured,
    categoryId: row.categoryId,
    status: row.status as PreviewStory["status"],
  };
}

export const getRelated = cached(async (postId: number, categoryId: number | null): Promise<Card[]> => {
  const same = categoryId
    ? await cards(and(published, eq(posts.categoryId, categoryId), ne(posts.id, postId)), 3)
    : [];
  if (same.length >= 3) return same;
  const more = await cards(
    and(published, sql`${posts.id} not in ${[postId, ...same.map((p) => p.id)]}`),
    3 - same.length,
  );
  return [...same, ...more];
}, "related");

export const getCategoryPage = cached(
  async (
    slug: string,
    page: number,
  ): Promise<{ category: Category; posts: Card[]; total: number } | null> => {
    if (!hasDatabase()) return null;
    const d = await db();
    const [category] = await d.select().from(categories).where(eq(categories.slug, slug));
    if (!category) return null;
    const where = and(published, eq(posts.categoryId, category.id));
    const [{ n }] = (await d
      .select({ n: sql<number>`count(*)` })
      .from(posts)
      .where(where)) as [{ n: number }];
    return { category, posts: await cards(where, PAGE_SIZE, (page - 1) * PAGE_SIZE), total: n };
  },
  "category",
);

export const getAuthor = cached(async (slug: string) => {
  if (!hasDatabase()) return null;
  const d = await db();
  const [author] = await d
    .select({ id: editors.id, name: editors.name, slug: editors.slug, bio: editors.bio })
    .from(editors)
    .where(eq(editors.slug, slug));
  if (!author) return null;
  return { author, posts: await cards(and(published, eq(posts.authorId, author.id)), 30) };
}, "author");

/** Everything published, newest first, for the feed and the sitemap. */
export const getAllPublished = cached(async (limit: number) => {
  if (!hasDatabase()) return [];
  return cards(published, limit);
}, "all");

/** Search isn't cached: every query is different. */
export async function search(q: string): Promise<Card[]> {
  const term = q.trim().slice(0, 100);
  if (!term || !hasDatabase()) return [];
  const pattern = `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  return cards(
    and(
      published,
      or(
        sql`${posts.title} like ${pattern} escape '\\'`,
        sql`${posts.dek} like ${pattern} escape '\\'`,
        sql`${posts.body} like ${pattern} escape '\\'`,
      ),
    ),
    30,
  );
}
