import { asc, count, desc, eq, sql } from "drizzle-orm";
import { ArrowRight, CalendarClock, CircleAlert, CircleCheck, PenLine } from "lucide-react";
import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { ago } from "@/lib/format";
import { hasMedia } from "@/lib/media";
import { messages, posts } from "@/lib/schema";
import { ActionForm } from "../../_components/action-form";
import { LocalTime } from "../../_components/local-time";
import { Page, PageHeader } from "../../_components/page-header";
import { StatusBadge } from "../../_components/status-badge";
import { buttonVariants } from "../../_components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card";
import { loadDemoContent } from "../actions";

export const metadata = { title: "Desk" };

export default async function Desk() {
  const editor = await requireEditor();
  const d = await db();
  const byStatus = await d.select({ status: posts.status, n: count() }).from(posts).groupBy(posts.status);
  const n = (s: string) => byStatus.find((r) => r.status === s)?.n ?? 0;
  const [{ unread }] = (await d
    .select({ unread: count() })
    .from(messages)
    .where(eq(messages.read, false))) as [{ unread: number }];
  const [{ reads }] = (await d
    .select({ reads: sql<number>`coalesce(sum(${posts.reads7d}), 0)` })
    .from(posts)) as [{ reads: number }];
  const [recent, upcoming, inbox] = await Promise.all([
    d.select().from(posts).orderBy(desc(posts.updatedAt)).limit(6),
    d
      .select({ id: posts.id, title: posts.title, publishedAt: posts.publishedAt })
      .from(posts)
      .where(eq(posts.status, "scheduled"))
      .orderBy(asc(posts.publishedAt))
      .limit(5),
    d.select().from(messages).where(eq(messages.read, false)).orderBy(desc(messages.createdAt)).limit(3),
  ]);
  const total = byStatus.reduce((a, r) => a + r.n, 0);
  const isAdmin = editor.role === "admin";

  const stats = [
    {
      label: "Published",
      value: n("published"),
      note: `${Number(reads).toLocaleString("en-GB")} reads in 7 days`,
      href: "/admin/posts?status=published",
    },
    {
      label: "Scheduled",
      value: n("scheduled"),
      note: "Waiting to go live",
      href: "/admin/posts?status=scheduled",
    },
    { label: "Drafts", value: n("draft"), note: "Not yet published", href: "/admin/posts?status=draft" },
    {
      label: "Unread messages",
      value: unread,
      note: unread ? "From the contact page" : "All caught up",
      href: "/admin/messages",
    },
  ];

  const checks: [string, boolean, string][] = [
    ["Database", true, "Bound, with its tables in place."],
    ["MEDIA bucket", hasMedia(), "Bind a public bucket named MEDIA to upload covers."],
    [
      "Public bucket address",
      Boolean(process.env.MEDIA_PUBLIC_URL),
      "Make the MEDIA bucket public so covers have an address.",
    ],
    [
      "Publishing job",
      Boolean(process.env.SITE_URL && process.env.REVALIDATE_SECRET),
      "Set SITE_URL and REVALIDATE_SECRET so scheduled stories refresh the pages when they go live.",
    ],
  ];

  return (
    <Page>
      <PageHeader
        title="Desk"
        description={`Signed in as ${editor.name}. What is live, what is waiting and what came in.`}
        actions={
          <Link href="/admin/posts/new" className={buttonVariants()}>
            <PenLine /> New story
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-3xl leading-none font-semibold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.note}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {total === 0 && isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>The newsroom is empty</CardTitle>
            <CardDescription>
              Load 18 made-up stories in six sections, with a cover drawn for each, to see the site filled in.
              {hasMedia() ? "" : " No MEDIA bucket is bound here, so the stories will have no covers."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm action={loadDemoContent} submit="Load demo content" pendingLabel="Loading" />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <Card className="pb-0">
            <CardHeader>
              <CardTitle>Recently changed</CardTitle>
              <CardDescription>The last stories anyone edited.</CardDescription>
              <CardAction>
                <Link href="/admin/posts" className={buttonVariants({ variant: "ghost" })}>
                  All stories <ArrowRight />
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              {recent.length ? (
                <ul className="divide-y border-t">
                  {recent.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 outline-none hover:bg-muted/50 focus-visible:bg-muted"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
                        <StatusBadge status={p.status} className="hidden sm:inline-flex" />
                        <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                          {ago(p.updatedAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No stories yet.</p>
              )}
            </CardContent>
          </Card>

          {inbox.length ? (
            <Card className="pb-0">
              <CardHeader>
                <CardTitle>Unread messages</CardTitle>
                <CardDescription>The latest from the contact page.</CardDescription>
                <CardAction>
                  <Link href="/admin/messages" className={buttonVariants({ variant: "ghost" })}>
                    Inbox <ArrowRight />
                  </Link>
                </CardAction>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y border-t">
                  {inbox.map((m) => (
                    <li key={m.id}>
                      <Link
                        href="/admin/messages?show=unread"
                        className="flex flex-col gap-0.5 px-4 py-2.5 outline-none hover:bg-muted/50 focus-visible:bg-muted"
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {m.subject || `Message from ${m.name}`}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">{ago(m.createdAt)}</span>
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {m.name}: {m.body}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card className="pb-0">
            <CardHeader>
              <CardTitle>Up next</CardTitle>
              <CardDescription>Scheduled stories, soonest first, in your time.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {upcoming.length ? (
                <ul className="divide-y border-t">
                  {upcoming.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="flex items-start gap-3 px-4 py-2.5 outline-none hover:bg-muted/50 focus-visible:bg-muted"
                      >
                        <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 font-medium">{p.title}</span>
                          <span className="text-xs text-muted-foreground">
                            <LocalTime ms={p.publishedAt} />
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
                  Nothing scheduled. Set a story to Scheduled to line it up.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup</CardTitle>
              <CardDescription>What this deployment has bound.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                {checks.map(([name, ok, help]) => (
                  <li key={name} className="flex items-start gap-2.5">
                    {ok ? (
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    )}
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">{name}</p>
                      {ok && name !== "Database" ? null : (
                        <p className="text-xs text-muted-foreground">{help}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}
