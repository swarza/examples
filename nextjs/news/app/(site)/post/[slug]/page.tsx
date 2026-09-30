import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/ArticleView";
import { getArticle, getRelated } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { ViewBeacon } from "./ViewBeacon";

/**
 * Incremental static regeneration: no story is built ahead of time; each is rendered on its first
 * visit and served from cache after that, until the newsroom changes (revalidateTag "posts").
 */
export const revalidate = 300;
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getArticle((await params).slug);
  if (!post) return {};
  const image = mediaUrl(post.coverKey);
  return {
    title: post.title,
    description: post.dek,
    openGraph: { title: post.title, description: post.dek, type: "article", images: image ? [image] : [] },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getArticle((await params).slug);
  if (!post) notFound();
  const related = await getRelated(post.id, post.categoryId);
  return (
    <>
      <ArticleView post={post} related={related} />
      <ViewBeacon postId={post.id} />
    </>
  );
}
