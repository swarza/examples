import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getAllPublished, getCategories } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const origin = `https://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const [posts, categories] = await Promise.all([getAllPublished(1000), getCategories()]);
  return [
    { url: `${origin}/`, changeFrequency: "hourly" },
    ...categories.map((c) => ({ url: `${origin}/category/${c.slug}`, changeFrequency: "daily" as const })),
    ...posts.map((p) => ({
      url: `${origin}/post/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
    })),
  ];
}
