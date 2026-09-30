import { db } from "@/lib/db";
import { hasMedia } from "@/lib/media";
import { categories, editors } from "@/lib/schema";
import { Page } from "../../../../_components/page-header";
import { PostForm } from "../../../../_components/post-form";

export const metadata = { title: "New story" };

export default async function NewStory() {
  const d = await db();
  const [cats, authors] = await Promise.all([
    d.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.position),
    d.select({ id: editors.id, name: editors.name }).from(editors).orderBy(editors.name),
  ]);
  return (
    <Page>
      <PostForm categories={cats} authors={authors} coverUrl={null} mediaReady={hasMedia()} />
    </Page>
  );
}
