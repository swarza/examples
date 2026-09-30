import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { ActionFieldError, ActionForm } from "../../_components/action-form";
import { Logo } from "../../_components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../_components/ui/card";
import { Field, FieldDescription, FieldLabel } from "../../_components/ui/field";
import { Input } from "../../_components/ui/input";
import { login } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next ?? "/admin";
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <Logo />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Sign in</CardTitle>
          <CardDescription>Use your editor email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm
            action={login}
            submit="Sign in"
            pendingLabel="Signing in"
            className="gap-4"
            submitClassName="w-full"
          >
            <input type="hidden" name="next" value={next} />
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" required autoComplete="username" autoFocus />
              <ActionFieldError name="email" />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
              <FieldDescription>
                The first time, use the ADMIN_EMAIL and ADMIN_PASSWORD set in the application&apos;s
                variables.
              </FieldDescription>
              <ActionFieldError name="password" />
            </Field>
          </ActionForm>
        </CardContent>
      </Card>
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to the site
      </a>
    </main>
  );
}
