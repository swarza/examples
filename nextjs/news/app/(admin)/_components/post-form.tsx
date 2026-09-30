"use client";
import { CircleAlert, ExternalLink, Eye, ImageOff, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState, useTransition } from "react";
import { previewMarkdown, previewStory, savePost, type PreviewResult } from "../admin/actions";
import { cn } from "../_lib/utils";
import { ConfirmAction } from "./confirm-action";
import { toLocalInput, timeZone, useIsClient } from "./local-time";
import { PageHeader } from "./page-header";
import { SaveBar } from "./save-bar";
import { SelectField } from "./select-field";
import { StatusBadge } from "./status-badge";
import { SubmitButton } from "./submit-button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button, buttonVariants } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useSavedLabel } from "./use-saved-label";
import { useUnsavedGuard } from "./use-unsaved-guard";
import { useActionToast } from "./use-action-toast";
import { useFieldError } from "./use-field-error";
import { useFormAction } from "./use-form-action";

const code =
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground";

type Option = { id: number; name: string };

export type PostFormPost = {
  id: number;
  title: string;
  slug: string;
  dek: string;
  body: string;
  status: "draft" | "scheduled" | "published";
  hero: boolean;
  featured: boolean;
  categoryId: number | null;
  authorId: number | null;
  coverAlt: string;
  /** When a scheduled story goes live (Unix ms), or null. */
  publishAt: number | null;
  /** When the story was last saved, in Unix milliseconds. */
  updatedAt: number;
};

/** Write and Preview for the story body; the preview is rendered by the site's own Markdown renderer. */
function BodyEditor({ defaultValue, onDirty }: { defaultValue?: string; onDirty: () => void }) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState("write");
  const [html, setHtml] = useState("");
  const [loading, startPreview] = useTransition();

  function choose(next: string) {
    setTab(next);
    if (next !== "preview") return;
    const source = textarea.current?.value ?? "";
    startPreview(async () => setHtml(await previewMarkdown(source)));
  }

  return (
    <Tabs value={tab} onValueChange={(v) => choose(String(v))} className="w-full flex-col gap-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <FieldLabel htmlFor="body">Story</FieldLabel>
        <TabsList aria-label="Story body" activateOnFocus>
          <TabsTrigger value="write" className="px-3">
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="px-3">
            Preview
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="write" keepMounted className="flex flex-col gap-2">
        <Textarea
          ref={textarea}
          id="body"
          name="body"
          rows={24}
          defaultValue={defaultValue}
          onChange={onDirty}
          className="min-h-[32rem] text-base leading-7 md:text-[15px]"
        />
        <FieldDescription className={code}>
          Markdown: <code>## subhead</code>, <code>**bold**</code>, <code>&gt; quote</code>,{" "}
          <code>- list</code>, <code>[link](https://…)</code>. Raw HTML is not rendered.
        </FieldDescription>
      </TabsContent>
      <TabsContent value="preview">
        <div className="min-h-[32rem] rounded-lg border px-4 py-4 md:px-6 md:py-5">
          {loading ? (
            <div className="space-y-3" aria-label="Loading the preview">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : html.trim() ? (
            <div className="admin-prose" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

/**
 * The story editor; `post` is absent for a new story. Scheduled times are in UTC. `coverUrl` is the
 * public address of the current cover, and `mediaReady` says whether a bucket is bound for uploads.
 */
export function PostForm({
  post,
  categories,
  authors,
  coverUrl,
  mediaReady,
  deleteAction,
}: {
  post?: PostFormPost;
  categories: Option[];
  authors: Option[];
  coverUrl: string | null;
  mediaReady: boolean;
  deleteAction?: (form: FormData) => Promise<void>;
}) {
  const { state, pending, onSubmit } = useFormAction(savePost);
  const [status, setStatus] = useState<string>(post?.status ?? "draft");
  const [dirty, setDirty] = useState(false);
  const client = useIsClient();
  const [publishAtIso, setPublishAtIso] = useState(
    post?.publishAt ? new Date(post.publishAt).toISOString() : "",
  );
  const [dekLength, setDekLength] = useState(post?.dek.length ?? 0);
  const form = useRef<HTMLFormElement>(null);
  const savedLabel = useSavedLabel(post?.updatedAt);
  const markDirty = () => setDirty(true);
  useActionToast(state);
  useFieldError(form, state);
  const errorFor = (name: string) => (state?.error && state.field === name ? state.error : undefined);
  const fieldError = (name: string) =>
    errorFor(name) ? <FieldError id={`${name}-error`}>{errorFor(name)}</FieldError> : null;

  // Cmd/Ctrl+S saves.
  useEffect(() => {
    const save = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (!pending) form.current?.requestSubmit();
    };
    window.addEventListener("keydown", save);
    return () => window.removeEventListener("keydown", save);
  }, [pending]);

  const { leave, dialog } = useUnsavedGuard({ dirty, pending });
  const cancel = () => leave("/admin/posts");

  // Preview never saves. With unsaved changes the form goes to previewStory as a snapshot and the
  // tab shows /preview/<id>?draft=<token>; the form stays as it is. The tab is opened on the click,
  // so popup blockers let it through.
  const [previewing, startPreview] = useTransition();
  const openPreview = () => {
    if (!post) return;
    if (!dirty) {
      window.open(`/preview/${post.id}`, "_blank", "noopener");
      return;
    }
    const tab = window.open("about:blank", "_blank");
    const data = new FormData(form.current!);
    startPreview(async () => {
      const result: PreviewResult = await previewStory(data).catch(() => ({
        error: "The preview could not be made.",
      }));
      if (!result.token) {
        tab?.close();
        toast.error(result.error ?? "The preview could not be made.");
        return;
      }
      const url = `/preview/${post.id}?draft=${result.token}`;
      if (tab && !tab.closed) {
        tab.opener = null;
        tab.location.href = url;
      } else window.open(url, "_blank", "noopener");
    });
  };

  const previewButton = (where: "header" | "bar") =>
    post ? (
      <Button
        type="button"
        variant="outline"
        onClick={openPreview}
        disabled={pending || previewing}
        aria-label="Preview"
        title={
          dirty
            ? "Shows your unsaved changes in a new tab. Nothing is saved or published; a new cover appears after saving."
            : undefined
        }
      >
        {previewing ? <Loader2 className="animate-spin" aria-hidden /> : <Eye />}
        <span className={cn(where === "bar" && "max-sm:sr-only")}>Preview</span>
      </Button>
    ) : (
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              tabIndex={0}
              className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          }
        >
          <Button
            type="button"
            variant="outline"
            disabled
            aria-label="Preview"
            className="pointer-events-none"
          >
            <Eye />
            <span className={cn(where === "bar" && "max-sm:sr-only")}>Preview</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save the story first</TooltipContent>
      </Tooltip>
    );

  return (
    <form
      ref={form}
      onSubmit={onSubmit}
      onChange={markDirty}
      encType="multipart/form-data"
      className="flex flex-col gap-6"
    >
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <PageHeader
        title={post ? "Edit story" : "New story"}
        description={
          post
            ? "Changes go live when you save, if the story is published."
            : "Start with a headline. Everything else can be filled in later."
        }
        actions={
          <>
            {post?.status === "published" ? (
              <a
                href={`/post/${post.slug}`}
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "ghost" })}
              >
                Open on site <ExternalLink />
              </a>
            ) : null}
            {previewButton("header")}
          </>
        }
      />

      {state?.error && !state.field ? (
        <Alert variant="destructive" role="alert">
          <CircleAlert />
          <AlertTitle>The story was not saved</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(errorFor("title"))}>
                <FieldLabel htmlFor="title">Headline</FieldLabel>
                <Input id="title" name="title" required maxLength={200} defaultValue={post?.title} />
                {fieldError("title")}
              </Field>
              <Field>
                <FieldLabel htmlFor="dek">Standfirst</FieldLabel>
                <Input
                  id="dek"
                  name="dek"
                  maxLength={400}
                  defaultValue={post?.dek}
                  aria-describedby="dek-help"
                  onChange={(e) => setDekLength(e.currentTarget.value.length)}
                />
                <FieldDescription id="dek-help" className="flex justify-between gap-4">
                  <span>The line under the headline.</span>
                  <span className={cn("tabular-nums", dekLength > 360 && "text-foreground")}>
                    {dekLength}/400
                  </span>
                </FieldDescription>
              </Field>
              <Field>
                <BodyEditor defaultValue={post?.body} onDirty={markDirty} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <SelectField
                    id="status"
                    name="status"
                    defaultValue={post?.status ?? "draft"}
                    onValueChange={(v) => {
                      setStatus(v);
                      markDirty();
                    }}
                    items={[
                      { value: "draft", label: "Draft" },
                      { value: "scheduled", label: "Scheduled" },
                      { value: "published", label: "Published" },
                    ]}
                  />
                </Field>
                {status === "scheduled" ? (
                  <Field data-invalid={Boolean(errorFor("publishAt"))}>
                    <FieldLabel htmlFor="publishAt">Publish at</FieldLabel>
                    {/* The field is in the editor's own time; the browser sends the exact moment. */}
                    <Input
                      key={client ? "local" : "server"}
                      id="publishAt"
                      name="publishAt"
                      type="datetime-local"
                      defaultValue={client && post?.publishAt ? toLocalInput(post.publishAt) : undefined}
                      onChange={(e) =>
                        setPublishAtIso(e.target.value ? new Date(e.target.value).toISOString() : "")
                      }
                      required
                    />
                    <input type="hidden" name="publishAtIso" value={publishAtIso} />
                    <FieldDescription>
                      {client ? `Your time (${timeZone()}). ` : ""}It goes live at that time, at most a minute
                      after.
                    </FieldDescription>
                    {fieldError("publishAt")}
                  </Field>
                ) : null}
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="hero">Lead story</FieldLabel>
                    <FieldDescription>Shown large at the top of the home page.</FieldDescription>
                  </FieldContent>
                  <Switch id="hero" name="hero" defaultChecked={post?.hero} onCheckedChange={markDirty} />
                </Field>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="featured">Featured</FieldLabel>
                    <FieldDescription>Listed in the featured strip.</FieldDescription>
                  </FieldContent>
                  <Switch
                    id="featured"
                    name="featured"
                    defaultChecked={post?.featured}
                    onCheckedChange={markDirty}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="categoryId">Section</FieldLabel>
                  <SelectField
                    id="categoryId"
                    name="categoryId"
                    defaultValue={post?.categoryId ? String(post.categoryId) : "none"}
                    onValueChange={markDirty}
                    items={[
                      { value: "none", label: "No section" },
                      ...categories.map((c) => ({ value: String(c.id), label: c.name })),
                    ]}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="authorId">Byline</FieldLabel>
                  <SelectField
                    id="authorId"
                    name="authorId"
                    defaultValue={post?.authorId ? String(post.authorId) : "me"}
                    onValueChange={markDirty}
                    items={[
                      { value: "me", label: "You" },
                      ...authors.map((a) => ({ value: String(a.id), label: a.name })),
                    ]}
                  />
                </Field>
                <Field data-invalid={Boolean(errorFor("slug"))}>
                  <FieldLabel htmlFor="slug">Address</FieldLabel>
                  <Input
                    id="slug"
                    name="slug"
                    maxLength={80}
                    defaultValue={post?.slug}
                    placeholder="made from the headline"
                    className="font-mono text-sm md:text-[13px]"
                  />
                  <FieldDescription>
                    Lowercase letters, digits and hyphens. The story lives at /post/
                    {post?.slug || "address"}.
                  </FieldDescription>
                  {fieldError("slug")}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover</CardTitle>
              <CardDescription>JPEG, PNG, WebP or GIF, up to 5 MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-4">
                {coverUrl ? (
                  <img src={coverUrl} alt="" className="aspect-3/2 w-full rounded-lg border object-cover" />
                ) : post ? (
                  <div className="flex aspect-3/2 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-xs text-muted-foreground">
                    <ImageOff className="size-5" aria-hidden />
                    No cover yet
                  </div>
                ) : null}
                {mediaReady ? null : (
                  <Alert>
                    <CircleAlert />
                    <AlertTitle>Uploads are off</AlertTitle>
                    <AlertDescription>
                      No MEDIA bucket is bound here, so a cover cannot be uploaded. Bind a public bucket as
                      MEDIA to enable it.
                    </AlertDescription>
                  </Alert>
                )}
                <Field data-invalid={Boolean(errorFor("cover"))}>
                  <FieldLabel htmlFor="cover">{coverUrl ? "Replace the cover" : "Upload a cover"}</FieldLabel>
                  <Input
                    id="cover"
                    name="cover"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={!mediaReady}
                  />
                  {fieldError("cover")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="coverAlt">Cover description</FieldLabel>
                  <Input id="coverAlt" name="coverAlt" maxLength={300} defaultValue={post?.coverAlt} />
                  <FieldDescription>Read aloud by screen readers.</FieldDescription>
                </Field>
                {coverUrl ? (
                  <Field orientation="horizontal">
                    <Checkbox id="removeCover" name="removeCover" onCheckedChange={markDirty} />
                    <FieldLabel htmlFor="removeCover" className="font-normal">
                      Remove the cover when saving
                    </FieldLabel>
                  </Field>
                ) : null}
              </FieldGroup>
            </CardContent>
          </Card>

          {post && deleteAction ? (
            <Card>
              <CardHeader>
                <CardTitle>Delete story</CardTitle>
                <CardDescription>Removes the story and its reads from the site for good.</CardDescription>
              </CardHeader>
              <CardContent>
                <ConfirmAction
                  action={deleteAction}
                  values={{ id: post.id }}
                  trigger="Delete this story"
                  triggerVariant="destructive"
                  triggerSize="default"
                  title="Delete this story?"
                  description={
                    <>
                      <strong className="font-medium text-foreground">{post.title}</strong> will be removed
                      from the site and cannot be recovered.
                    </>
                  }
                  confirm="Delete story"
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Always in reach: the save bar sticks to the bottom of the window. */}
      <SaveBar
        dirty={dirty}
        savedLabel={savedLabel}
        leading={<StatusBadge status={status} className="max-sm:hidden" />}
      >
        <Button type="button" variant="ghost" onClick={cancel}>
          Cancel
        </Button>
        {previewButton("bar")}
        <SubmitButton
          pending={pending}
          pendingLabel="Saving"
          title="Save (Ctrl+S or ⌘S)"
          aria-keyshortcuts="Control+S Meta+S"
        >
          <Save /> {post ? "Save story" : "Create story"}
        </SubmitButton>
      </SaveBar>

      {dialog}
    </form>
  );
}
