import { count, eq } from "drizzle-orm";
import { Tags, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, posts } from "@/lib/schema";
import { ActionFieldError, ActionForm } from "../../../_components/action-form";
import { ConfirmAction } from "../../../_components/confirm-action";
import { Page, PageHeader } from "../../../_components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../_components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../../_components/ui/empty";
import { Field, FieldDescription, FieldLabel } from "../../../_components/ui/field";
import { Input } from "../../../_components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../_components/ui/table";
import { deleteCategory, saveCategory } from "../../actions";

export const metadata = { title: "Sections" };

export default async function Sections() {
  await requireAdmin();
  const d = await db();
  const rows = await d
    .select({ id: categories.id, name: categories.name, slug: categories.slug, stories: count(posts.id) })
    .from(categories)
    .leftJoin(posts, eq(posts.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.position);
  return (
    <Page>
      <PageHeader
        title="Sections"
        description="The topics stories are filed under. Each section has its own page on the site."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {rows.length ? (
          <Card className="py-0">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead className="hidden w-48 xl:table-cell">Address</TableHead>
                  <TableHead className="w-20 text-right">Stories</TableHead>
                  <TableHead className="w-14">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-4">
                      <span className="block truncate font-medium">{c.name}</span>
                      <span className="block truncate font-mono text-xs text-muted-foreground xl:hidden">
                        /category/{c.slug}
                      </span>
                    </TableCell>
                    <TableCell className="hidden truncate font-mono text-xs text-muted-foreground xl:table-cell">
                      /category/{c.slug}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.stories}</TableCell>
                    <TableCell className="pr-2">
                      <ConfirmAction
                        action={deleteCategory}
                        values={{ id: c.id }}
                        trigger={<Trash2 />}
                        triggerSize="icon-sm"
                        triggerLabel={`Remove ${c.name}`}
                        title={`Remove ${c.name}?`}
                        description={
                          c.stories
                            ? `The ${c.stories} ${c.stories === 1 ? "story" : "stories"} in it will stay, without a section.`
                            : "No stories are filed under it."
                        }
                        confirm="Remove section"
                        pendingLabel="Removing"
                        success={`Removed ${c.name}.`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Tags />
              </EmptyMedia>
              <EmptyTitle>No sections yet</EmptyTitle>
              <EmptyDescription>Add the first one with the form.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Add a section</CardTitle>
            <CardDescription>The address is made from the name.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm
              action={saveCategory}
              submit="Add section"
              pendingLabel="Adding"
              reset
              className="gap-4"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" name="name" required maxLength={60} />
                  <ActionFieldError name="name" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Input id="description" name="description" maxLength={300} />
                  <FieldDescription>Optional. Shown at the top of the section page.</FieldDescription>
                  <ActionFieldError name="description" />
                </Field>
              </div>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
