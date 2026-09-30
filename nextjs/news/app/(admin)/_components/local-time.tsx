"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => undefined;

/** True in the browser after hydration; the server and the first client render see false. */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** The browser's time zone, e.g. "Europe/Warsaw". */
export const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** "2026-09-29T21:20" in the browser's time zone, for a datetime-local input. */
export function toLocalInput(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * A time in the reader's own time zone ("29 Sept, 23:20"). The server doesn't know that zone, so
 * it renders UTC (marked as such) and the browser swaps in local time after hydration.
 */
export function LocalTime({ ms }: { ms: number | null }) {
  const client = useIsClient();
  if (ms === null) return null;
  const date = new Date(ms);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  };
  const text = client
    ? date.toLocaleString("en-GB", opts)
    : `${date.toLocaleString("en-GB", { ...opts, timeZone: "UTC" })} UTC`;
  return (
    <time dateTime={date.toISOString()} title={client ? timeZone() : undefined}>
      {text}
    </time>
  );
}
