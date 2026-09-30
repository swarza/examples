"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

/**
 * While `dirty`, closing the tab asks the browser's question, and links inside the admin (sidebar,
 * breadcrumb) open a "Discard your changes?" dialog; confirming continues to where the editor was
 * going. `leave(href)` asks the same way for buttons such as Cancel. Render `dialog` once.
 */
export function useUnsavedGuard({
  dirty,
  pending,
  what = "this story",
}: {
  dirty: boolean;
  pending: boolean;
  what?: string;
}) {
  const router = useRouter();
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const discarded = useRef(false);
  const active = dirty && !pending;

  useEffect(() => {
    if (!active) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (discarded.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const intercept = (event: MouseEvent) => {
      if (discarded.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith("/admin")) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      event.preventDefault();
      event.stopPropagation();
      setLeaveTo(url.pathname + url.search);
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", intercept, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", intercept, true);
    };
  }, [active]);

  const leave = (href: string) => (active ? setLeaveTo(href) : router.push(href));

  const dialog = (
    <AlertDialog open={leaveTo !== null} onOpenChange={(open) => (open ? undefined : setLeaveTo(null))}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
          <AlertDialogDescription>The changes you made to {what} have not been saved.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              const to = leaveTo ?? "/admin";
              discarded.current = true;
              setLeaveTo(null);
              router.push(to);
            }}
          >
            Discard changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { leave, dialog };
}
