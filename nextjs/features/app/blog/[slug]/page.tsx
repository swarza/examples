import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/posts";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  return { title: post?.title ?? "Not found" };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <p>
        Rendered at <time id="rendered">{new Date().toISOString()}</time>.
      </p>
    </article>
  );
}
