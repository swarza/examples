import { count, eq } from "drizzle-orm";
import { coverOrder, coverSvg } from "./covers";
import { db } from "./db";
import { demoAuthors, demoCategories, demoPosts } from "./demo-content";
import { hasMedia, putMedia } from "./media";
import { categories, editors, postViews, posts } from "./schema";
import { slugify } from "./slug";

/**
 * Fills an empty newsroom: sections, four bylines (they can't sign in), 38 stories with covers
 * drawn as SVG and uploaded to the MEDIA bucket, and a week of made-up reads.
 */
export async function loadDemo(): Promise<{ posts: number; covers: number }> {
  const d = await db();
  const [{ n }] = (await d.select({ n: count() }).from(posts)) as [{ n: number }];
  if (n > 0) throw new Error("There are posts already; demo content goes into an empty newsroom.");
  const now = Date.now();

  const cats = await d
    .insert(categories)
    .values(demoCategories.map((c, position) => ({ ...c, position })))
    .onConflictDoNothing()
    .returning();
  const catId = new Map(cats.map((c) => [c.slug, c.id]));

  const authors = await d
    .insert(editors)
    .values(
      demoAuthors.map((a) => ({
        ...a,
        slug: slugify(a.name),
        // Not a valid scrypt hash, so these bylines can't sign in.
        passwordHash: "disabled",
        role: "editor" as const,
      })),
    )
    .onConflictDoNothing()
    .returning();

  // Cover styles rotate in publishing order; one story in three of each section gets a black one.
  const order = coverOrder(demoPosts);
  let covers = 0;
  for (const p of demoPosts) {
    const slug = slugify(p.title);
    const at = Math.round(now - p.hoursAgo * 3_600_000);
    let coverKey: string | null = null;
    if (hasMedia()) {
      coverKey = `covers/demo-${slug}.svg`;
      await putMedia(coverKey, coverSvg(slug, p.title, order.get(p)), "image/svg+xml");
      covers++;
    }
    const status = p.draft ? "draft" : p.hoursAgo < 0 ? "scheduled" : "published";
    const [row] = await d
      .insert(posts)
      .values({
        slug,
        title: p.title,
        dek: p.dek,
        body: p.body,
        categoryId: catId.get(p.category) ?? null,
        authorId: authors[p.author]?.id ?? null,
        coverKey,
        coverAlt: "",
        status,
        hero: Boolean(p.hero),
        featured: Boolean(p.featured),
        publishedAt: p.draft ? null : at,
        createdAt: at,
        updatedAt: at,
      })
      .returning();
    if (status !== "published" || !row) continue;
    // A week of reads, more for newer and featured stories.
    const weight = (p.featured || p.hero ? 3 : 1) * Math.max(1, 8 - p.hoursAgo / 24);
    let total = 0;
    for (let day = 0; day < 7; day++) {
      const c = Math.round(weight * (5 + ((slug.length * (day + 3)) % 17)));
      total += c;
      await d
        .insert(postViews)
        .values({
          postId: row.id,
          day: new Date(now - day * 86_400_000).toISOString().slice(0, 10),
          count: c,
        })
        .onConflictDoNothing();
    }
    await d.update(posts).set({ reads7d: total }).where(eq(posts.id, row.id));
  }
  return { posts: demoPosts.length, covers };
}
