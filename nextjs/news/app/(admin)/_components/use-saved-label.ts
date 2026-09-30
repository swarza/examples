"use client";
import { useEffect, useState } from "react";

/** "Saved just now", "Saved at 14:32", or "Saved on 28 Sept": in the editor's own time zone. */
export function useSavedLabel(at: number | undefined) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!at) return;
    const update = () => {
      const ms = Date.now() - at;
      const date = new Date(at);
      setLabel(
        ms < 60_000
          ? "Saved just now"
          : date.toDateString() === new Date().toDateString()
            ? `Saved at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : `Saved on ${date.toLocaleDateString([], { day: "numeric", month: "short" })}`,
      );
    };
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, [at]);
  return label;
}
