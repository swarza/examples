import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasMedia, mediaUrl } from "@/lib/media";
import { categories, editors, posts } from "@/lib/schema";
import { Page } from "../../../../_components/page-header";
import { PostForm } from "../../../../_components/post-form";
import { deletePost } from "../../../actions";

export const metadata = { title: "Edit story" };

export default async function EditStory({ params }: { params: Promise<{ id: string }> }) {
  const d = await db();
  const [post] = await d
    .select()
    .from(posts)
    .where(eq(posts.id, Number((await params).id)));
  if (!post) notFound();
  const [cats, authors] = await Promise.all([
    d.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.position),
    d.select({ id: editors.id, name: editors.name }).from(editors).orderBy(editors.name),
  ]);
  return (
    <Page>
      <PostForm
        key={post.updatedAt}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          dek: post.dek,
          body: post.body,
          status: post.status,
          hero: post.hero,
          featured: post.featured,
          categoryId: post.categoryId,
          authorId: post.authorId,
          coverAlt: post.coverAlt,
          publishAt: post.status === "scheduled" ? post.publishedAt : null,
          updatedAt: post.updatedAt,
        }}
        categories={cats}
        authors={authors}
        coverUrl={mediaUrl(post.coverKey)}
        mediaReady={hasMedia()}
        deleteAction={deletePost}
      />
    </Page>
  );
}
