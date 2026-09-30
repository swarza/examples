"use server";
import { and, eq, like, lt, ne } from "drizzle-orm";
import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireEditor, signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadDemo } from "@/lib/demo";
import { hasMedia, imageTypes, putMedia } from "@/lib/media";
import { renderMarkdown } from "@/lib/markdown";
import { hashPassword } from "@/lib/password";
import { FRONT_PAGE_KEY, resolveFrontPage } from "@/lib/front-page";
import { categories, editors, messages, posts, settings } from "@/lib/schema";
import { isSlug, slugify } from "@/lib/slug";

/** `field` names the input an error is about, so the form can mark and focus it. */
export type FormState = { error?: string; field?: string; ok?: string } | null;

const text = (form: FormData, name: string, max = 200) =>
  String(form.get(name) ?? "")
    .trim()
    .slice(0, max);

/** Every public page reads stories through the "posts" tag; this refreshes them all. */
function published() {
  updateTag("posts");
  // Also expire it for requests outside this action (the front page otherwise waits for its minute).
  revalidateTag("posts", { expire: 0 });
  revalidatePath("/", "layout");
}

// ── Session ──────────────────────────────────────────────────────────────────

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const result = await signIn(text(form, "email"), String(form.get("password") ?? ""));
  if (!result.ok) return { error: result.message };
  const next = text(form, "next");
  // Back to where the editor was going: the newsroom or a preview (never another site).
  const safe = /^\/(admin|preview)(\/|\?|$)/.test(next) && !next.startsWith("//");
  redirect(safe ? next : "/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin/login");
}

// ── Posts ────────────────────────────────────────────────────────────────────

const MAX_COVER_BYTES = 5 * 1024 * 1024;

export async function savePost(_: FormState, form: FormData): Promise<FormState> {
  const editor = await requireEditor();
  const d = await db();
  const id = Number(form.get("id")) || null;
  const title = text(form, "title", 200);
  if (!title) return { error: "A story needs a headline.", field: "title" };
  const slug = text(form, "slug", 80) || slugify(title);
  if (!isSlug(slug))
    return { error: "The address may use lowercase letters, digits and hyphens.", field: "slug" };
  const [taken] = await d
    .select({ id: posts.id })
    .from(posts)
    .where(id ? and(eq(posts.slug, slug), ne(posts.id, id)) : eq(posts.slug, slug));
  if (taken) return { error: `Another story already uses the address /post/${slug}.`, field: "slug" };

  const status =
    (["draft", "scheduled", "published"] as const).find((s) => s === form.get("status")) ?? "draft";
  let publishedAt: number | null = null;
  if (status === "scheduled") {
    // The browser sends the moment in publishAtIso; a bare publishAt (no script) is read as UTC.
    const iso = text(form, "publishAtIso", 40);
    publishedAt = Date.parse(iso || `${text(form, "publishAt", 20)}Z`);
    if (!Number.isFinite(publishedAt) || publishedAt <= Date.now())
      return { error: "Pick a time in the future to schedule the story.", field: "publishAt" };
  }
  const [existing] = id ? await d.select().from(posts).where(eq(posts.id, id)) : [];
  if (id && !existing) return { error: "That story no longer exists." };
  if (status === "published")
    publishedAt =
      existing?.status === "published" && existing.publishedAt ? existing.publishedAt : Date.now();

  let coverKey = existing?.coverKey ?? null;
  const cover = form.get("cover");
  if (cover instanceof File && cover.size > 0) {
    const ext = imageTypes[cover.type];
    if (!ext) return { error: "Covers can be JPEG, PNG, WebP or GIF.", field: "cover" };
    if (cover.size > MAX_COVER_BYTES) return { error: "Covers can be up to 5 MB.", field: "cover" };
    if (!hasMedia()) return { error: "Bind a public bucket as MEDIA to upload covers.", field: "cover" };
    coverKey = `covers/${slug}-${Date.now().toString(36)}.${ext}`;
    await putMedia(coverKey, new Uint8Array(await cover.arrayBuffer()), cover.type);
  }
  if (form.get("removeCover")) coverKey = null;

  const values = {
    title,
    slug,
    dek: text(form, "dek", 400),
    body: String(form.get("body") ?? "").slice(0, 100_000),
    categoryId: Number(form.get("categoryId")) || null,
    authorId: Number(form.get("authorId")) || existing?.authorId || editor.id,
    coverKey,
    coverAlt: text(form, "coverAlt", 300),
    status,
    hero: form.get("hero") === "on",
    featured: form.get("featured") === "on",
    publishedAt,
    updatedAt: Date.now(),
  };
  const [row] = id
    ? await d.update(posts).set(values).where(eq(posts.id, id)).returning()
    : await d.insert(posts).values(values).returning();
  published();
  await d.delete(settings).where(like(settings.key, `${previewPrefix(row!.id)}%`));
  redirect(`/admin/posts/${row!.id}?saved=1`);
}

/** Unsaved changes for the story preview live in settings under `preview:<story>:<editor>`. */
const previewPrefix = (storyId: number) => `preview:${storyId}:`;

export type PreviewResult = { token: string; error?: undefined } | { error: string; token?: undefined };

/**
 * Stores the editor's unsaved form as a snapshot for /preview/<id>?draft=<token>, without saving
 * the story: nothing changes on the site. The token is the snapshot's time; each Preview replaces
 * the editor's previous snapshot, and saving or deleting the story removes them.
 */
export async function previewStory(form: FormData): Promise<PreviewResult> {
  const editor = await requireEditor();
  const id = Number(form.get("id"));
  const d = await db();
  const [post] = id ? await d.select().from(posts).where(eq(posts.id, id)) : [];
  if (!post) return { error: "Save the story first." };
  const categoryId = Number(form.get("categoryId")) || null;
  const authorId = Number(form.get("authorId")) || post.authorId || editor.id;
  const [category] = categoryId
    ? await d
        .select({ slug: categories.slug, name: categories.name })
        .from(categories)
        .where(eq(categories.id, categoryId))
    : [];
  const [author] = await d
    .select({ slug: editors.slug, name: editors.name })
    .from(editors)
    .where(eq(editors.id, authorId));
  const snapshot = {
    title: text(form, "title", 200) || post.title,
    dek: text(form, "dek", 400),
    body: String(form.get("body") ?? "").slice(0, 100_000),
    hero: form.get("hero") === "on",
    featured: form.get("featured") === "on",
    categoryId: category ? categoryId : null,
    category: category ?? null,
    author: author ?? null,
    // A new cover file is not uploaded for a preview; the stored one shows unless it is removed.
    coverKey: form.get("removeCover") ? null : post.coverKey,
    coverAlt: text(form, "coverAlt", 300),
  };
  // Snapshots of edits nobody saved (a discarded form, a closed tab) go after a day.
  await d
    .delete(settings)
    .where(and(like(settings.key, "preview:%"), lt(settings.updatedAt, Date.now() - 86_400_000)));
  const key = `${previewPrefix(post.id)}${editor.id}`;
  const value = JSON.stringify(snapshot);
  const updatedAt = Date.now();
  await d
    .insert(settings)
    .values({ key, value, updatedAt })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt } });
  return { token: String(updatedAt) };
}

/** The story body as the site renders it (Markdown, raw HTML escaped), for the editor's Preview tab. */
export async function previewMarkdown(body: string): Promise<string> {
  await requireEditor();
  return renderMarkdown(String(body ?? "").slice(0, 100_000));
}

export async function deletePost(form: FormData) {
  await requireEditor();
  const d = await db();
  const id = Number(form.get("id"));
  await d.delete(posts).where(eq(posts.id, id));
  await d.delete(settings).where(like(settings.key, `${previewPrefix(id)}%`));
  published();
  redirect("/admin/posts?deleted=1");
}

// ── Sections ─────────────────────────────────────────────────────────────────

export async function saveCategory(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name = text(form, "name", 60);
  if (!name) return { error: "A section needs a name.", field: "name" };
  const slug = slugify(name);
  const d = await db();
  const [taken] = await d.select().from(categories).where(eq(categories.slug, slug));
  if (taken) return { error: `There is already a section at /category/${slug}.`, field: "name" };
  const all = await d.select({ id: categories.id }).from(categories);
  await d
    .insert(categories)
    .values({ name, slug, description: text(form, "description", 300), position: all.length });
  published();
  return { ok: `Added ${name}.` };
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const d = await db();
  // Its stories stay, without a section.
  await d.delete(categories).where(eq(categories.id, Number(form.get("id"))));
  published();
}

// ── Editors ──────────────────────────────────────────────────────────────────

export async function addEditor(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name = text(form, "name", 100);
  const email = text(form, "email", 200).toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!name) return { error: "Give the editor a name.", field: "name" };
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) return { error: "Give a valid email address.", field: "email" };
  if (password.length < 10) return { error: "Passwords need at least 10 characters.", field: "password" };
  const d = await db();
  const [taken] = await d.select({ id: editors.id }).from(editors).where(eq(editors.email, email));
  if (taken) return { error: "An editor with that email exists already.", field: "email" };
  let slug = slugify(name) || "editor";
  if ((await d.select({ id: editors.id }).from(editors).where(eq(editors.slug, slug))).length)
    slug = `${slug}-${Date.now().toString(36)}`;
  await d.insert(editors).values({
    name,
    email,
    slug,
    passwordHash: await hashPassword(password),
    role: form.get("role") === "admin" ? "admin" : "editor",
  });
  revalidatePath("/admin/editors");
  return { ok: `${name} can sign in now.` };
}

export async function removeEditor(form: FormData) {
  const me = await requireAdmin();
  const id = Number(form.get("id"));
  if (id === me.id) return;
  const d = await db();
  await d.delete(editors).where(eq(editors.id, id));
  published();
}

// ── Inbox ────────────────────────────────────────────────────────────────────

export async function markMessage(form: FormData) {
  await requireEditor();
  const d = await db();
  await d
    .update(messages)
    .set({ read: form.get("read") === "1" })
    .where(eq(messages.id, Number(form.get("id"))));
  revalidatePath("/admin/messages");
}

export async function deleteMessage(form: FormData) {
  await requireEditor();
  const d = await db();
  await d.delete(messages).where(eq(messages.id, Number(form.get("id"))));
  revalidatePath("/admin/messages");
}

// ── Front page ───────────────────────────────────────────────────────────────

/**
 * Saves the front page's arrangement: whatever is posted goes through resolveFrontPage, so only a
 * complete, valid list for the current sections is stored. Admins only.
 */
export async function saveFrontPage(json: string): Promise<FormState> {
  await requireAdmin();
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(json).slice(0, 100_000));
  } catch {
    return { error: "That arrangement could not be read. Reload the page and try again." };
  }
  if (!Array.isArray(parsed)) return { error: "That arrangement could not be read." };
  const d = await db();
  const cats = await d.select().from(categories).orderBy(categories.position, categories.name);
  const value = JSON.stringify(resolveFrontPage(parsed, cats));
  const updatedAt = Date.now();
  await d
    .insert(settings)
    .values({ key: FRONT_PAGE_KEY, value, updatedAt })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt } });
  published();
  return { ok: "Front page saved. The site shows it on its next request." };
}

/** Back to the default arrangement: the stored one is deleted. */
export async function resetFrontPage(): Promise<FormState> {
  await requireAdmin();
  const d = await db();
  await d.delete(settings).where(eq(settings.key, FRONT_PAGE_KEY));
  published();
  return { ok: "Front page reset to the default arrangement." };
}

// ── Demo content ─────────────────────────────────────────────────────────────

export async function loadDemoContent(_: FormState): Promise<FormState> {
  await requireAdmin();
  try {
    const r = await loadDemo();
    published();
    return {
      ok: `Loaded ${r.posts} stories${r.covers ? ` with ${r.covers} covers` : " (no MEDIA bucket, so no covers)"}. One is scheduled a few minutes from now.`,
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
