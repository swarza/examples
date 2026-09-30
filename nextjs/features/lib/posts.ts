import { unstable_cache } from "next/cache";

export type Post = { slug: string; title: string; body: string };

const posts: Post[] = [
  { slug: "hello", title: "Hello, swarza", body: "A prerendered post, built with generateStaticParams." },
  {
    slug: "isr",
    title: "Incremental regeneration",
    body: "Pages regenerate in the background after their revalidate time.",
  },
];

/** Reads posts through the data cache, tagged so they can be revalidated on demand. */
export const getPosts = unstable_cache(async () => posts, ["posts"], { tags: ["posts"], revalidate: 3600 });

export async function getPost(slug: string): Promise<Post | undefined> {
  const all = await getPosts();
  return (
    all.find((p) => p.slug === slug) ??
    (slug.startsWith("new-")
      ? { slug, title: slug, body: "Rendered on first request, then cached." }
      : undefined)
  );
}
