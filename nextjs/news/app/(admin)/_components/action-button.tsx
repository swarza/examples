"use client";
import { Loader2 } from "lucide-react";
import { useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

/** A one-click server action with no confirmation, for changes that are easy to undo. */
export function ActionButton({
  action,
  values,
  children,
  success,
  variant = "outline",
  size = "sm",
}: {
  action: (form: FormData) => Promise<void>;
  values: Record<string, string | number>;
  children: ReactNode;
  success?: string;
  variant?: "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "xs";
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const form = new FormData();
          for (const [k, v] of Object.entries(values)) form.set(k, String(v));
          try {
            await action(form);
            if (success) toast.success(success);
          } catch {
            toast.error("That did not work. Try again.");
          }
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </Button>
  );
}
