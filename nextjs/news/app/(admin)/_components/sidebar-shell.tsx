"use client";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { SidebarProvider } from "./ui/sidebar";

const WIDE = "(min-width: 1024px)";
const watchWide = (onChange: () => void) => {
  const query = matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * The sidebar opens expanded on wide windows and as icons below 1024px, until the editor toggles it;
 * from then on their choice (kept in the sidebar_state cookie) wins. The width-based default is
 * remembered in sidebar_auto so the server renders the same state and the sidebar doesn't jump.
 */
export function SidebarShell({
  saved,
  auto,
  children,
}: {
  saved: boolean | undefined;
  auto: boolean | undefined;
  children: ReactNode;
}) {
  const wide = useSyncExternalStore(
    watchWide,
    () => matchMedia(WIDE).matches,
    () => saved ?? auto ?? true,
  );
  useEffect(() => {
    if (saved === undefined)
      document.cookie = `sidebar_auto=${wide}; path=/admin; max-age=31536000; samesite=lax`;
  }, [wide, saved]);
  const [choice, setChoice] = useState(saved);
  return (
    <SidebarProvider open={choice ?? wide} onOpenChange={setChoice}>
      {children}
    </SidebarProvider>
  );
}
