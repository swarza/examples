/**
 * "Are we open?", worked out on the server from the opening hours and the current time in the
 * shop's time zone. The server's own clock is in UTC, so everything goes through Intl.
 */
import { hours } from "./data.mjs";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const toMinutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

/** The weekday (0 = Monday), the time and the date as the shop sees them. */
export function localTime(timeZone, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type) => parts.find((p) => p.type === type).value;
  return {
    day: WEEKDAYS.indexOf(part("weekday")),
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
    time: `${part("hour")}:${part("minute")}`,
    date: new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date),
  };
}

/**
 * Open or closed right now, and when that changes next:
 * `{ open: true, closes: "17:00", closingSoon }` or `{ open: false, opens: { day: "tomorrow", time } }`.
 */
export function openStatus(timeZone, date = new Date()) {
  const now = localTime(timeZone, date);
  const today = hours[now.day];
  if (today.open && now.minutes >= toMinutes(today.open) && now.minutes < toMinutes(today.close)) {
    return { open: true, closes: today.close, closingSoon: toMinutes(today.close) - now.minutes <= 30, now };
  }
  for (let ahead = 0; ahead < 8; ahead++) {
    const day = hours[(now.day + ahead) % 7];
    if (!day.open || (ahead === 0 && now.minutes >= toMinutes(day.open))) continue;
    const name = ahead === 0 ? "today" : ahead === 1 ? "tomorrow" : day.day;
    return { open: false, opens: { day: name, time: day.open }, now };
  }
  return { open: false, opens: null, now };
}

/** One line for people: "Open until 17:00", "Closed, opens tomorrow at 07:30". */
export function statusText(status) {
  if (status.open)
    return status.closingSoon ? `Closing soon, at ${status.closes}` : `Open until ${status.closes}`;
  if (!status.opens) return "Closed";
  return `Closed, opens ${status.opens.day} at ${status.opens.time}`;
}
