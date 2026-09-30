import { count, desc, eq } from "drizzle-orm";
import { ExternalLink, Eye, FileText, MoreHorizontal, PenLine, Pencil } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ago } from "@/lib/format";
import { categories, editors, posts } from "@/lib/schema";
import { Page, PageHeader } from "../../../_components/page-header";
import { StatusBadge } from "../../../_components/status-badge";
import { Button, buttonVariants } from "../../../_components/ui/button";
import { Card } from "../../../_components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../_components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../../_components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../_components/ui/table";
import { FilterTabs } from "../../../_components/filter-tabs";
import { LocalTime } from "../../../_components/local-time";

export const metadata = { title: "Stories" };

const filters = [
  ["all", "All"],
  ["published", "Published"],
  ["scheduled", "Scheduled"],
  ["draft", "Drafts"],
] as const;

export default async function Stories({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const wanted = (await searchParams).status;
  const status = filters.find(([f]) => f === wanted)?.[0] ?? "all";
  const d = await db();
  const [rows, counts] = await Promise.all([
    d
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        publishedAt: posts.publishedAt,
        updatedAt: posts.updatedAt,
        reads: posts.reads7d,
        category: categories.name,
        author: editors.name,
      })
      .from(posts)
      .leftJoin(categories, eq(categories.id, posts.categoryId))
      .leftJoin(editors, eq(editors.id, posts.authorId))
      .where(status === "all" ? undefined : eq(posts.status, status))
      .orderBy(desc(posts.updatedAt)),
    d.select({ status: posts.status, n: count() }).from(posts).groupBy(posts.status),
  ]);
  const total = counts.reduce((a, r) => a + r.n, 0);
  const countOf = (f: string) => (f === "all" ? total : (counts.find((c) => c.status === f)?.n ?? 0));

  return (
    <Page>
      <PageHeader
        title="Stories"
        description="Every story, newest changes first. Filter by status to see what is live or waiting."
        actions={
          <Link href="/admin/posts/new" className={buttonVariants()}>
            <PenLine /> New story
          </Link>
        }
      />

      <FilterTabs
        label="Filter by status"
        value={status}
        filters={filters.map(([f, label]) => ({
          value: f,
          label,
          href: f === "all" ? "/admin/posts" : `/admin/posts?status=${f}`,
          count: countOf(f),
        }))}
      />

      {rows.length ? (
        <>
          {/* Phones and narrow windows: one stacked row per story. */}
          <Card className="py-0 lg:hidden">
            <ul className="divide-y">
              {rows.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="flex flex-col gap-1.5 px-4 py-3 outline-none hover:bg-muted/50 focus-visible:bg-muted"
                  >
                    <span className="line-clamp-2 font-medium">{p.title}</span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <StatusBadge status={p.status} />
                      {p.status === "scheduled" ? (
                        <span>
                          <LocalTime ms={p.publishedAt} />
                        </span>
                      ) : null}
                      {p.category ? <span>{p.category}</span> : null}
                      <span className="ml-auto">{ago(p.updatedAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="hidden py-0 lg:flex">
            <Table className="min-w-[36rem] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Headline</TableHead>
                  <TableHead className="hidden w-32 xl:table-cell">Section</TableHead>
                  <TableHead className="hidden w-36 xl:table-cell">Byline</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead className="hidden w-20 text-right xl:table-cell">Reads</TableHead>
                  <TableHead className="w-28 text-right">Changed</TableHead>
                  <TableHead className="w-14">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4">
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="block truncate rounded-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                        title={p.title}
                      >
                        {p.title}
                      </Link>
                      <span className="block truncate text-xs text-muted-foreground">/post/{p.slug}</span>
                    </TableCell>
                    <TableCell className="hidden truncate xl:table-cell">
                      {p.category ?? <span className="text-muted-foreground">None</span>}
                    </TableCell>
                    <TableCell className="hidden truncate xl:table-cell">
                      {p.author ?? <span className="text-muted-foreground">None</span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                      {p.status === "scheduled" ? (
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          <LocalTime ms={p.publishedAt} />
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums xl:table-cell">
                      {p.reads.toLocaleString("en-GB")}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{ago(p.updatedAt)}</TableCell>
                    <TableCell className="pr-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${p.title}`} />
                          }
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem render={<Link href={`/admin/posts/${p.id}`} />}>
                            <Pencil /> Edit story
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            render={<a href={`/preview/${p.id}`} target="_blank" rel="noopener" />}
                          >
                            <Eye /> Preview
                          </DropdownMenuItem>
                          {p.status === "published" ? (
                            <DropdownMenuItem
                              render={<a href={`/post/${p.slug}`} target="_blank" rel="noopener" />}
                            >
                              <ExternalLink /> Open on site
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>{status === "all" ? "No stories yet" : `No ${status} stories`}</EmptyTitle>
            <EmptyDescription>
              {status === "all"
                ? "Write the first story, or load demo content from the desk."
                : "Nothing has this status right now."}
            </EmptyDescription>
          </EmptyHeader>
          <Link href="/admin/posts/new" className={buttonVariants()}>
            <PenLine /> New story
          </Link>
        </Empty>
      )}
    </Page>
  );
}
