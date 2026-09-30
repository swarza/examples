import { desc } from "drizzle-orm";
import { Inbox, Mail, MailOpen, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { ago } from "@/lib/format";
import { messages } from "@/lib/schema";
import { FilterTabs } from "../../../_components/filter-tabs";
import { ActionButton } from "../../../_components/action-button";
import { ConfirmAction } from "../../../_components/confirm-action";
import { Page, PageHeader } from "../../../_components/page-header";
import { Badge } from "../../../_components/ui/badge";
import { Card } from "../../../_components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../../_components/ui/empty";
import { cn } from "../../../_lib/utils";
import { deleteMessage, markMessage } from "../../actions";

export const metadata = { title: "Inbox" };

const filters = [
  ["all", "All"],
  ["unread", "Unread"],
] as const;

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const show = (await searchParams).show === "unread" ? "unread" : "all";
  const d = await db();
  const all = await d.select().from(messages).orderBy(desc(messages.createdAt)).limit(200);
  const unread = all.filter((m) => !m.read).length;
  const rows = show === "unread" ? all.filter((m) => !m.read) : all;

  return (
    <Page>
      <PageHeader title="Inbox" description="Messages sent from the contact page, newest first." />

      {all.length ? (
        <FilterTabs
          label="Filter messages"
          value={show}
          filters={filters.map(([f, label]) => ({
            value: f,
            label,
            href: f === "all" ? "/admin/messages" : `/admin/messages?show=${f}`,
            count: f === "all" ? all.length : unread,
          }))}
        />
      ) : null}

      {rows.length ? (
        <div className="flex flex-col gap-4">
          {rows.map((m) => (
            <Card key={m.id} className={cn(m.read && "bg-muted/30")}>
              <article
                className="flex flex-col gap-3 px-(--card-spacing)"
                aria-label={m.subject || `Message from ${m.name}`}
              >
                <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{m.name}</span>
                      {m.read ? null : <Badge>New</Badge>}
                    </p>
                    <a
                      href={`mailto:${m.email}`}
                      className="block truncate text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      {m.email}
                    </a>
                  </div>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={new Date(m.createdAt).toISOString()}
                  >
                    {ago(m.createdAt)}
                  </time>
                </header>
                {m.subject ? <h2 className="text-sm font-semibold">{m.subject}</h2> : null}
                <p className="max-w-prose text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                <footer className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <ActionButton
                    action={markMessage}
                    values={{ id: m.id, read: m.read ? "0" : "1" }}
                    success={m.read ? "Marked as unread." : "Marked as read."}
                  >
                    {m.read ? <Mail /> : <MailOpen />}
                    {m.read ? "Mark unread" : "Mark read"}
                  </ActionButton>
                  <ConfirmAction
                    action={deleteMessage}
                    values={{ id: m.id }}
                    trigger={
                      <>
                        <Trash2 /> Delete
                      </>
                    }
                    title="Delete this message?"
                    description={`The message from ${m.name} will be removed for good.`}
                    confirm="Delete message"
                    success="Message deleted."
                  />
                </footer>
              </article>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>{all.length ? "No unread messages" : "No messages yet"}</EmptyTitle>
            <EmptyDescription>
              {all.length ? "Everything has been read." : "They arrive from the contact page on the site."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </Page>
  );
}
