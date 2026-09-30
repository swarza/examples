"use client";
import { useEffect } from "react";

/** Counts a read once per visit, after the page is shown: the page itself is cached, the count isn't. */
export function ViewBeacon({ postId }: { postId: number }) {
  useEffect(() => {
    const key = `read:${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: count anyway.
    }
    navigator.sendBeacon?.("/api/views", JSON.stringify({ postId }));
  }, [postId]);
  return null;
}
