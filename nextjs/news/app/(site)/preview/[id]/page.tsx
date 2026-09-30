import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleView } from "@/components/ArticleView";
import { PreviewBar } from "@/components/PreviewBar";
import { currentEditor } from "@/lib/auth";
import { getPreviewStory, getRelated, type PreviewStory } from "@/lib/content";
import { db } from "@/lib/db";
import { dateTime } from "@/lib/format";
import { settings } from "@/lib/schema";

/**
 * A story in any state, exactly as its page will show it, for signed-in editors. Read straight from
 * the database on every request (no cache), never indexed, and no reads are counted.
 *
 * `?draft=<token>` shows the editor's unsaved changes instead: the newsroom's Preview button stores
 * them under `preview:<story>:<editor>` in settings (previewStory in app/(admin)/admin/actions.ts),
 * and the token is that snapshot's updatedAt, so an old tab never shows a newer or older draft.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/** The fields a snapshot may replace. */
const draftFields = [
  "title",
  "dek",
  "body",
  "hero",
  "featured",
  "categoryId",
  "category",
  "author",
  "coverKey",
  "coverAlt",
] as const;

async function draftOf(storyId: number, editorId: number, token: string) {
  const d = await db();
  const [row] = await d
    .select()
    .from(settings)
    .where(eq(settings.key, `preview:${storyId}:${editorId}`));
  if (!row || String(row.updatedAt) !== token) return null;
  try {
    const value = JSON.parse(row.value) as Partial<PreviewStory>;
    return Object.fromEntries(draftFields.filter((k) => k in value).map((k) => [k, value[k]]));
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ draft?: string }> };

export default async function StoryPreview({ params, searchParams }: Props) {
  const { id } = await params;
  const { draft } = await searchParams;
  const editor = await currentEditor();
  if (!editor) {
    const back = `/preview/${id}${draft ? `?draft=${encodeURIComponent(draft)}` : ""}`;
    redirect(`/admin/login?next=${encodeURIComponent(back)}`);
  }
  const saved = await getPreviewStory(Number(id));
  if (!saved) notFound();
  const changes = draft ? await draftOf(saved.id, editor.id, draft) : null;
  const post: PreviewStory = changes ? { ...saved, ...changes } : saved;
  const related = await getRelated(post.id, post.categoryId);
  const status =
    post.status === "draft"
      ? "Draft · not public"
      : post.status === "scheduled"
        ? `Scheduled for ${dateTime(post.publishedAt)} · not public yet`
        : "Published";
  // A stale token (the editor previewed again since) falls back to the saved story, and says so.
  const state = changes
    ? `${status} · with your unsaved changes, which only you see`
    : draft
      ? `${status} · showing the saved version`
      : status;
  return (
    <>
      <PreviewBar edit={`/admin/posts/${post.id}`}>Preview · {state}</PreviewBar>
      <ArticleView post={post} related={related} />
    </>
  );
}
