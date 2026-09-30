"use client";
import { Loader2 } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

type Values = Record<string, string | number>;

function toForm(values: Values) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, String(value));
  return form;
}

/**
 * A destructive action behind a confirmation dialog. `action` is a server action taking FormData;
 * `values` become its fields. Actions that redirect away simply navigate.
 */
export function ConfirmAction({
  action,
  values,
  trigger,
  title,
  description,
  confirm = "Delete",
  pendingLabel = "Deleting",
  success,
  triggerVariant = "ghost",
  triggerSize = "sm",
  triggerLabel,
}: {
  action: (form: FormData) => Promise<void>;
  values: Values;
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirm?: string;
  pendingLabel?: string;
  success?: string;
  triggerVariant?: "ghost" | "outline" | "destructive";
  triggerSize?: "sm" | "default" | "icon-sm" | "xs";
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function run() {
    start(async () => {
      try {
        await action(toForm(values));
        setOpen(false);
        if (success) toast.success(success);
      } catch (e) {
        // Next navigates for a redirect by throwing; that is not a failure.
        if (e instanceof Error && /NEXT_REDIRECT/.test(e.message)) throw e;
        toast.error("That did not work. Try again.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => (pending ? undefined : setOpen(next))}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant={triggerVariant}
            size={triggerSize}
            aria-label={triggerLabel}
            className={
              triggerVariant === "ghost"
                ? triggerSize === "icon-sm"
                  ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  : "text-destructive hover:bg-destructive/10 hover:text-destructive"
                : undefined
            }
          />
        }
      >
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button type="button" variant="destructive" disabled={pending} onClick={run}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {pending ? `${pendingLabel}…` : confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
