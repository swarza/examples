"use client";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "./ui/button";

/** A submit button that shows a spinner and its pending label while the form action runs. */
export function SubmitButton({
  pending,
  pendingLabel = "Working",
  children,
  ...props
}: ComponentProps<typeof Button> & { pending: boolean; pendingLabel?: string }) {
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} {...props}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {pending ? `${pendingLabel}…` : children}
    </Button>
  );
}
