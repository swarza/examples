"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const messages: Record<string, string> = {
  saved: "Story saved. The site shows the change on its next request.",
  deleted: "Story deleted.",
};

/** Shows a toast for a `?saved=1` or `?deleted=1` left by a redirecting action, then tidies the URL. */
export function Flash() {
  const path = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let found = false;
    for (const key of Object.keys(messages)) {
      if (!params.has(key)) continue;
      toast.success(messages[key]!, { id: key });
      params.delete(key);
      found = true;
    }
    if (!found) return;
    const rest = params.toString();
    history.replaceState(history.state, "", path + (rest ? `?${rest}` : ""));
  }, [path, search]);
  return null;
}
