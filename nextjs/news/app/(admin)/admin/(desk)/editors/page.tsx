import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { editors } from "@/lib/schema";
import { ActionFieldError, ActionForm } from "../../../_components/action-form";
import { ConfirmAction } from "../../../_components/confirm-action";
import { Page, PageHeader } from "../../../_components/page-header";
import { SelectField } from "../../../_components/select-field";
import { Badge } from "../../../_components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../_components/ui/card";
import { Field, FieldDescription, FieldLabel } from "../../../_components/ui/field";
import { Input } from "../../../_components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../_components/ui/table";
import { addEditor, removeEditor } from "../../actions";

export const metadata = { title: "Editors" };

export default async function Editors() {
  const me = await requireAdmin();
  const d = await db();
  const rows = await d.select().from(editors).orderBy(editors.name);
  return (
    <Page>
      <PageHeader
        title="Editors"
        description="People who can sign in, and bylines that only appear on stories."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="py-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead className="hidden w-56 xl:table-cell">Email</TableHead>
                <TableHead className="w-28">Role</TableHead>
                <TableHead className="w-14">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="pl-4">
                    <span className="block truncate font-medium">
                      {e.name}
                      {e.id === me.id ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">you</span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground xl:hidden">{e.email}</span>
                  </TableCell>
                  <TableCell className="hidden truncate text-muted-foreground xl:table-cell">
                    {e.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={e.role === "admin" && e.passwordHash !== "disabled" ? "secondary" : "outline"}
                    >
                      {e.passwordHash === "disabled"
                        ? "Byline only"
                        : e.role === "admin"
                          ? "Admin"
                          : "Editor"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-2">
                    {e.id !== me.id ? (
                      <ConfirmAction
                        action={removeEditor}
                        values={{ id: e.id }}
                        trigger={<Trash2 />}
                        triggerSize="icon-sm"
                        triggerLabel={`Remove ${e.name}`}
                        title={`Remove ${e.name}?`}
                        description="They can no longer sign in. Their stories stay, without a byline."
                        confirm="Remove editor"
                        pendingLabel="Removing"
                        success={`Removed ${e.name}.`}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add an editor</CardTitle>
            <CardDescription>They sign in with the email and password you set here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm action={addEditor} submit="Add editor" pendingLabel="Adding" reset className="gap-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" name="name" required maxLength={100} />
                  <ActionFieldError name="name" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name="email" type="email" required maxLength={200} />
                  <ActionFieldError name="email" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                  />
                  <FieldDescription>At least 10 characters. Share it with them yourself.</FieldDescription>
                  <ActionFieldError name="password" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <SelectField
                    id="role"
                    name="role"
                    defaultValue="editor"
                    items={[
                      { value: "editor", label: "Editor" },
                      { value: "admin", label: "Admin" },
                    ]}
                  />
                  <FieldDescription>
                    Editors work on stories and the inbox. Admins also manage sections and editors.
                  </FieldDescription>
                  <ActionFieldError name="role" />
                </Field>
              </div>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
