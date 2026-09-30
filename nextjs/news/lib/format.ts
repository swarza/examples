const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** "29 September 2026" */
export const longDate = (ms: number | null) => (ms ? dateFormat.format(ms) : "");
/** "29 Sept" */
export const shortDate = (ms: number | null) => (ms ? shortFormat.format(ms) : "");

/** "5 min ago", "3 h ago", or the date. */
export function ago(ms: number | null, now = Date.now()) {
  if (!ms) return "";
  const minutes = Math.round((now - ms) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} h ago`;
  return shortDate(ms);
}

const editionFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "No. 272 · Tuesday 29 September 2026": the day of the year is the edition number. */
export function edition(ms: number) {
  const d = new Date(ms);
  const day = Math.floor((ms - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86_400_000) + 1;
  return `No. ${day} · ${editionFormat.format(ms).replace(",", "")}`;
}

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/** "30 September 2026 at 14:05 UTC" */
export const dateTime = (ms: number | null) => (ms ? `${dateTimeFormat.format(ms)} UTC` : "");
