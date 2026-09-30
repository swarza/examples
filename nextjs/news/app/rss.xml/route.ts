import { getAllPublished } from "@/lib/content";

export const revalidate = 600;

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The latest 30 stories as RSS 2.0. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const posts = await getAllPublished(30);
  const items = posts
    .map(
      (p) =>
        `<item><title>${escape(p.title)}</title><link>${origin}/post/${p.slug}</link><guid>${origin}/post/${p.slug}</guid><description>${escape(p.dek)}</description>${p.publishedAt ? `<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : ""}${p.category ? `<category>${escape(p.category.name)}</category>` : ""}</item>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Dispatch</title><link>${origin}</link><description>A demo newsroom on swarza.</description>${items}</channel></rss>`,
    { headers: { "content-type": "application/rss+xml; charset=utf-8" } },
  );
}
